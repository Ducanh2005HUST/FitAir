import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        location: true,
        bio: true,
        sports: { select: { sport: true } },
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, email: true, name: true, avatarUrl: true, location: true, bio: true },
    });
  }

  async getPublicProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        location: true,
        bio: true,
        createdAt: true,
        sports: { select: { sport: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getProfileDetail(viewerId: string, id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        location: true,
        bio: true,
        createdAt: true,
        sports: { select: { sport: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    if (viewerId === id) return { ...user, emailVisible: true };

    const accepted = await this.prisma.friendRequest.findFirst({
      where: {
        status: 'accepted',
        OR: [
          { requesterId: viewerId, addresseeId: id },
          { requesterId: id, addresseeId: viewerId },
        ],
      },
      select: { id: true },
    });

    if (!accepted) {
      return {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        location: user.location,
        bio: user.bio,
        createdAt: user.createdAt,
        sports: user.sports,
        email: null,
        emailVisible: false,
      };
    }

    return { ...user, emailVisible: true };
  }
}
