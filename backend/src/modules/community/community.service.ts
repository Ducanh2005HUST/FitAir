import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FriendsService } from '../friends/friends.service';

@Injectable()
export class CommunityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly friends: FriendsService,
  ) {}

  async list(keyword?: string, viewerUserId?: string) {
    const posts = await this.prisma.communityPost.findMany({
      where: keyword
        ? {
            OR: [
              { content: { contains: keyword, mode: 'insensitive' } },
              { sport: { contains: keyword, mode: 'insensitive' } },
              { location: { contains: keyword, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { id: true, name: true, avatarUrl: true } }, _count: { select: { participants: true, likes: true, comments: true } } },
    });

    if (!viewerUserId) return posts as any;

    const ids = posts.map((p) => p.id);
    const [joins, likes] = await Promise.all([
      this.prisma.postParticipant.findMany({
        where: { userId: viewerUserId, postId: { in: ids } },
        select: { postId: true },
      }),
      this.prisma.postLike.findMany({
        where: { userId: viewerUserId, postId: { in: ids } },
        select: { postId: true },
      }),
    ]);
    const joinedSet = new Set(joins.map((x) => x.postId));
    const likedSet = new Set(likes.map((x) => x.postId));

    return posts.map((p) => ({
      ...p,
      viewerJoined: joinedSet.has(p.id),
      viewerLiked: likedSet.has(p.id),
    })) as any;
  }

  async create(userId: string, dto: CreatePostDto) {
    const post = await this.prisma.communityPost.create({
      data: {
        userId,
        content: dto.content,
        sport: dto.sport,
        location: dto.location,
        time: dto.time,
        maxParticipants: dto.maxParticipants,
      },
    });

    const friendIds = await this.friends.acceptedFriendIds(userId);
    if (friendIds.length) {
      await this.prisma.notification.createMany({
        data: friendIds.map((fid) => ({
          userId: fid,
          type: 'friend_post',
          title: 'FitAir',
          message: '友達がコミュニティに投稿しました。',
          data: { postId: post.id, userId },
        })),
      });
    }

    return post;
  }

  async join(userId: string, postId: string) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const count = await this.prisma.postParticipant.count({ where: { postId } });
    if (post.maxParticipants != null && count >= post.maxParticipants) throw new BadRequestException('Post is full');

    await this.prisma.postParticipant.upsert({
      where: { postId_userId: { postId, userId } },
      create: { postId, userId },
      update: {},
    });

    if (post.userId !== userId) {
      await this.prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'post_join',
          title: 'FitAir',
          message: '参加者が追加されました。',
        },
      });
    }
    return { ok: true };
  }

  async leave(userId: string, postId: string) {
    const existing = await this.prisma.postParticipant.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (!existing) return { ok: true };
    await this.prisma.postParticipant.delete({ where: { id: existing.id } });
    return { ok: true };
  }

  async toggleLike(userId: string, postId: string) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (existing) {
      await this.prisma.postLike.delete({ where: { id: existing.id } });
      return { liked: false };
    }
    await this.prisma.postLike.create({ data: { postId, userId } });
    return { liked: true };
  }

  async comment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    return this.prisma.postComment.create({ data: { postId, userId, content: dto.content } });
  }

  comments(postId: string) {
    return this.prisma.postComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      take: 500,
    });
  }

  participants(postId: string) {
    return this.prisma.postParticipant.findMany({
      where: { postId },
      orderBy: { joinedAt: 'asc' },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      take: 200,
    });
  }
}
