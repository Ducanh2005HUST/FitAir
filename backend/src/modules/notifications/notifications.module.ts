import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PushModule } from '../push/push.module';
import { EnvironmentModule } from '../environment/environment.module';
import { NotificationJobsService } from './notification-jobs.service';

@Module({
  imports: [PrismaModule, PushModule, EnvironmentModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationJobsService],
})
export class NotificationsModule {}
