import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { FriendsService } from './friends.service';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friends: FriendsService) {}

  @Get()
  list(@CurrentUser() user: { userId: string }) {
    return this.friends.list(user.userId);
  }

  @Get(':id/relationship')
  relationship(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.friends.relationship(user.userId, id);
  }

  @Post(':id/request')
  request(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.friends.request(user.userId, id);
  }

  @Post(':id/accept')
  accept(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.friends.accept(user.userId, id);
  }

  @Post(':id/reject')
  reject(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.friends.reject(user.userId, id);
  }

  @Delete(':id/request')
  cancel(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.friends.cancel(user.userId, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.friends.remove(user.userId, id);
  }
}
