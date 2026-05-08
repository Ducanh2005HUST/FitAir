import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CommunityService } from './community.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts')
export class CommunityController {
  constructor(private readonly community: CommunityService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  list(@CurrentUser() user: { userId: string } | null, @Query('keyword') keyword?: string) {
    return this.community.list(keyword, user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreatePostDto) {
    return this.community.create(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  join(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.community.join(user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/leave')
  leave(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.community.leave(user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  like(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.community.toggleLike(user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  comment(@CurrentUser() user: { userId: string }, @Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.community.comment(user.userId, id, dto);
  }

  @Get(':id/comments')
  comments(@Param('id') id: string) {
    return this.community.comments(id);
  }

  @Get(':id/participants')
  participants(@Param('id') id: string) {
    return this.community.participants(id);
  }
}
