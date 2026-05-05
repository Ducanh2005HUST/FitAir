import { Module } from '@nestjs/common';
import { SpotsController } from './spots.controller';
import { SpotsService } from './spots.service';
import { GooglePlacesModule } from '../google-places/google-places.module';

@Module({
  imports: [GooglePlacesModule],
  controllers: [SpotsController],
  providers: [SpotsService],
})
export class SpotsModule {}
