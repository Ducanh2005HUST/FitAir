import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IndoorService {
  constructor(private readonly prisma: PrismaService) {}

  list(category?: string) {
    return this.prisma.indoorVideo.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async detail(id: string) {
    const v = await this.prisma.indoorVideo.findUnique({ where: { id } });
    if (!v) throw new NotFoundException('Video not found');
    return v;
  }
}

