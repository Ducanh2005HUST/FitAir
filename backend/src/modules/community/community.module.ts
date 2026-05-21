import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FriendsModule } from '../friends/friends.module';

@Module({
  imports: [PrismaModule, FriendsModule],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
