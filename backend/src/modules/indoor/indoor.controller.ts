import { Controller, Get, Param, Query } from '@nestjs/common';
import { IndoorService } from './indoor.service';

@Controller('videos')
export class IndoorController {
  constructor(private readonly indoor: IndoorService) {}

  @Get()
  list(@Query('category') category?: string) {
    return this.indoor.list(category);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.indoor.detail(id);
  }
}

