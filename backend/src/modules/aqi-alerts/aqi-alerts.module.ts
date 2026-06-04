import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PushModule } from '../push/push.module';
import { MailModule } from '../mail/mail.module';
import { AqiAlertsService } from './aqi-alerts.service';

@Module({
  imports: [ConfigModule, PrismaModule, PushModule, MailModule],
  providers: [AqiAlertsService],
  exports: [AqiAlertsService],
})
export class AqiAlertsModule {}
