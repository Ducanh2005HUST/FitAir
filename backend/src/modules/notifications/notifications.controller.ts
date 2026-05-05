import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: { userId: string }) {
    return this.notifications.list(user.userId);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.notifications.markRead(user.userId, id);
  }
}

