import { Module } from '@nestjs/common';
import { AqiAlertsModule } from '../aqi-alerts/aqi-alerts.module';
import { EnvironmentController } from './environment.controller';
import { EnvironmentService } from './environment.service';

@Module({
  imports: [AqiAlertsModule],
  controllers: [EnvironmentController],
  providers: [EnvironmentService],
  exports: [EnvironmentService],
})
export class EnvironmentModule {}
