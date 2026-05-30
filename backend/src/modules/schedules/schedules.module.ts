import { Module } from '@nestjs/common';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FriendsModule } from '../friends/friends.module';
import { PushModule } from '../push/push.module';

@Module({
  imports: [PrismaModule, FriendsModule, PushModule],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
