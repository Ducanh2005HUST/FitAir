import { Module } from '@nestjs/common';
import { SerpApiService } from './serpapi.service';

@Module({
  providers: [SerpApiService],
  exports: [SerpApiService],
})
export class SerpApiModule {}

