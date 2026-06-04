import { Controller, Get, Query } from '@nestjs/common';
import { AqiAlertsService } from '../aqi-alerts/aqi-alerts.service';
import { EnvironmentService } from './environment.service';

@Controller('environment')
export class EnvironmentController {
  constructor(
    private readonly env: EnvironmentService,
    private readonly aqiAlerts: AqiAlertsService,
  ) {}

  @Get('aqi')
  async aqi(@Query('lat') lat?: string, @Query('lng') lng?: string) {
    const reading = await this.env.aqi(lat, lng);
    void this.aqiAlerts.notifyAllUsersForReading(reading).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[AQI Alert] failed', err);
    });
    return reading;
  }

  @Get('weather')
  weather(@Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.env.weather(lat, lng);
  }
}
