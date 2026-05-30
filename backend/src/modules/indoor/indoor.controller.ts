import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IndoorService } from './indoor.service';

@Controller('videos')
export class IndoorController {
  constructor(private readonly indoor: IndoorService) {}

  @Post('sync')
  sync(
    @Body() body: { category?: string; max?: number } | undefined,
  ) {
    return this.indoor.syncFromYoutube({
      category: body?.category,
      max: body?.max,
    });
  }

  // Dev helper: force Japanese titles for existing rows.
  @Post('normalize-titles')
  normalizeTitles() {
    return this.indoor.normalizeJapaneseTitles();
  }

  @Get('youtube/search')
  youtubeSearch(
    @Query('query') query?: string,
    @Query('max') max?: string,
  ) {
    return this.indoor.youtubeSearch({
      query: query ?? '',
      maxResults: max ? Number(max) : undefined,
    });
  }

  @Get()
  list(
    @Query('category') category?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.indoor.list({
      category,
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined,
    });
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.indoor.detail(id);
  }
}
