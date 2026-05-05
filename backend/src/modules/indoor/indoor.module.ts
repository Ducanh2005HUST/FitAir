import { Module } from '@nestjs/common';
import { IndoorController } from './indoor.controller';
import { IndoorService } from './indoor.service';

@Module({
  controllers: [IndoorController],
  providers: [IndoorService],
})
export class IndoorModule {}

