import { Module } from '@nestjs/common';
import { SpotsController } from './spots.controller';
import { SpotsService } from './spots.service';
import { GooglePlacesModule } from '../google-places/google-places.module';
import { SerpApiModule } from '../serpapi/serpapi.module';

@Module({
  imports: [GooglePlacesModule, SerpApiModule],
  controllers: [SpotsController],
  providers: [SpotsService],
})
export class SpotsModule {}
