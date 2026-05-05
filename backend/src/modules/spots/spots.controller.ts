import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchSpotsDto } from './dto/search-spots.dto';
import { SpotsService } from './spots.service';

@Controller('spots')
export class SpotsController {
  constructor(private readonly spots: SpotsService) {}

  @Get()
  search(@Query() q: SearchSpotsDto) {
    return this.spots.search(q);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.spots.detail(id);
  }

  @Get(':id/reviews')
  reviews(@Param('id') id: string) {
    return this.spots.reviews(id);
  }
}

