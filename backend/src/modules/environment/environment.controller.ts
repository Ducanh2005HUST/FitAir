import { Controller, Get, Query } from '@nestjs/common';
import { EnvironmentService } from './environment.service';

@Controller('environment')
export class EnvironmentController {
  constructor(private readonly env: EnvironmentService) {}

  @Get('aqi')
  aqi(@Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.env.aqi(lat, lng);
  }

  @Get('weather')
  weather(@Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.env.weather(lat, lng);
  }
}

