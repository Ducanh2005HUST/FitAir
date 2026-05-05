import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(spotId: string, userId: string, dto: CreateReviewDto) {
    const spot = await this.prisma.spot.findUnique({ where: { id: spotId } });
    if (!spot) throw new NotFoundException('Spot not found');

    if (dto.rating < 1 || dto.rating > 5) throw new BadRequestException('Invalid rating');

    const review = await this.prisma.spotReview.create({
      data: { spotId, userId, rating: dto.rating, comment: dto.comment },
    });

    const agg = await this.prisma.spotReview.aggregate({
      where: { spotId },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await this.prisma.spot.update({
      where: { id: spotId },
      data: {
        avgRating: agg._avg.rating ?? 0,
        reviewCount: agg._count._all,
      },
    });

    return review;
  }
}

