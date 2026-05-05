import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('spots/:spotId/reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('spotId') spotId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviews.create(spotId, user.userId, dto);
  }
}

