import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SchedulesService } from './schedules.service';

@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedules: SchedulesService) {}

  @Get()
  list(
    @CurrentUser() user: { userId: string },
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.schedules.list(user.userId, month, year);
  }

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateScheduleDto) {
    return this.schedules.create(user.userId, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: { userId: string }, @Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    return this.schedules.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.schedules.remove(user.userId, id);
  }
}

