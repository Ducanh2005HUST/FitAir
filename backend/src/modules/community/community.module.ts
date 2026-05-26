import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FriendsModule } from '../friends/friends.module';
import { PushModule } from '../push/push.module';

@Module({
  imports: [PrismaModule, FriendsModule, PushModule],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
