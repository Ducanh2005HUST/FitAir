import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const rows = await this.prisma.friendRequest.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
        requester: { select: { id: true, name: true, avatarUrl: true, location: true } },
        addressee: { select: { id: true, name: true, avatarUrl: true, location: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    });

    return rows.map((r: { requesterId: string; requester: any; addressee: any }) =>
      r.requesterId === userId ? r.addressee : r.requester,
    );
  }

  async relationship(userId: string, otherUserId: string) {
    if (userId === otherUserId) return { status: 'self' as const };

    const existing = await this.prisma.friendRequest.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: otherUserId },
          { requesterId: otherUserId, addresseeId: userId },
        ],
      },
      select: { requesterId: true, addresseeId: true, status: true },
    });

    if (!existing) return { status: 'none' as const };
    if (existing.status === 'accepted') return { status: 'friends' as const };
    if (existing.requesterId === userId && existing.addresseeId === otherUserId) return { status: 'outgoing_pending' as const };
    return { status: 'incoming_pending' as const };
  }

  async request(requesterId: string, targetUserId: string) {
    if (requesterId === targetUserId) throw new BadRequestException('自分を友達に追加することはできません');

    const target = await this.prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true } });
    if (!target) throw new NotFoundException('ユーザーが見つかりません');

    const existing = await this.prisma.friendRequest.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId: targetUserId },
          { requesterId: targetUserId, addresseeId: requesterId },
        ],
      },
    });

    if (existing?.status === 'accepted') return { ok: true, status: 'accepted' as const };
    if (existing && existing.requesterId === requesterId && existing.addresseeId === targetUserId && existing.status === 'pending') {
      return { ok: true, status: 'pending' as const };
    }
    if (existing && existing.requesterId === targetUserId && existing.addresseeId === requesterId && existing.status === 'pending') {
      return { ok: true, status: 'incoming_pending' as const };
    }

    await this.prisma.friendRequest.create({
      data: { requesterId, addresseeId: targetUserId, status: 'pending' },
    });

    await this.prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'friend_request',
        title: 'FitAir',
        message: '友達申請が届きました。',
        data: {
          requesterId,
          action: { label: 'プロフィールで確認', path: `/users/${requesterId}` },
        },
      },
    });

    return { ok: true, status: 'pending' as const };
  }

  async accept(addresseeId: string, requesterId: string) {
    const req = await this.prisma.friendRequest.findFirst({
      where: { requesterId, addresseeId, status: 'pending' },
    });
    if (!req) throw new NotFoundException('友達申請が見つかりません');

    await this.prisma.friendRequest.update({ where: { id: req.id }, data: { status: 'accepted' } });

    await this.prisma.notification.create({
      data: {
        userId: requesterId,
        type: 'friend_accept',
        title: 'FitAir',
        message: '友達申請が承認されました。',
        data: { userId: addresseeId },
      },
    });

    return { ok: true };
  }

  async reject(addresseeId: string, requesterId: string) {
    const req = await this.prisma.friendRequest.findFirst({
      where: { requesterId, addresseeId, status: 'pending' },
    });
    if (!req) throw new NotFoundException('友達申請が見つかりません');

    await this.prisma.friendRequest.delete({ where: { id: req.id } });
    return { ok: true };
  }

  async cancel(requesterId: string, targetUserId: string) {
    const req = await this.prisma.friendRequest.findFirst({
      where: { requesterId, addresseeId: targetUserId, status: 'pending' },
    });
    if (!req) throw new NotFoundException('申請が見つかりません');
    await this.prisma.friendRequest.delete({ where: { id: req.id } });
    return { ok: true };
  }

  async remove(userId: string, otherUserId: string) {
    await this.prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { requesterId: userId, addresseeId: otherUserId },
          { requesterId: otherUserId, addresseeId: userId },
        ],
      },
    });
    return { ok: true };
  }

  async acceptedFriendIds(userId: string) {
    const rows = await this.prisma.friendRequest.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: { requesterId: true, addresseeId: true },
      take: 1000,
    });
    const out = new Set<string>();
    for (const r of rows) out.add(r.requesterId === userId ? r.addresseeId : r.requesterId);
    return Array.from(out);
  }
}
