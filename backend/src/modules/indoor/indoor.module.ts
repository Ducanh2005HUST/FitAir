import { Module } from '@nestjs/common';
import { IndoorController } from './indoor.controller';
import { IndoorService } from './indoor.service';
import { SerpApiModule } from '../serpapi/serpapi.module';

@Module({
  imports: [SerpApiModule],
  controllers: [IndoorController],
  providers: [IndoorService],
})
export class IndoorModule {}
