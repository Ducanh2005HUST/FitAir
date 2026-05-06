import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PushService } from './push.service';

@Controller('push')
export class PushController {
  constructor(private readonly push: PushService) {}

  @Get('public-key')
  publicKey() {
    return this.push.publicKey();
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  subscribe(
    @CurrentUser() user: { userId: string },
    @Body()
    body: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
      userAgent?: string;
    },
  ) {
    return this.push.upsertSubscription(user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('unsubscribe')
  unsubscribe(
    @CurrentUser() user: { userId: string },
    @Body() body: { endpoint: string },
  ) {
    return this.push.removeSubscription(user.userId, body.endpoint);
  }
}

