import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, month?: string, year?: string) {
    const m = month ? Number(month) : undefined;
    const y = year ? Number(year) : undefined;

    let from: Date | undefined;
    let to: Date | undefined;
    if (m != null && y != null && Number.isFinite(m) && Number.isFinite(y)) {
      from = new Date(Date.UTC(y, m - 1, 1));
      to = new Date(Date.UTC(y, m, 1));
    }

    return this.prisma.schedule.findMany({
      where: {
        userId,
        ...(from && to ? { date: { gte: from, lt: to } } : {}),
      },
      orderBy: [{ date: 'asc' }],
      take: 500,
    });
  }

  create(userId: string, dto: CreateScheduleDto) {
    return this.prisma.schedule.create({
      data: { userId, title: dto.title, type: dto.type, date: new Date(dto.date), time: dto.time, note: dto.note },
    });
  }

  async update(userId: string, id: string, dto: UpdateScheduleDto) {
    const existing = await this.prisma.schedule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Schedule not found');
    if (existing.userId !== userId) throw new ForbiddenException();

    return this.prisma.schedule.update({
      where: { id },
      data: {
        ...(dto.title != null ? { title: dto.title } : {}),
        ...(dto.type != null ? { type: dto.type } : {}),
        ...(dto.date != null ? { date: new Date(dto.date) } : {}),
        ...(dto.time != null ? { time: dto.time } : {}),
        ...(dto.note != null ? { note: dto.note } : {}),
      },
    });
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.schedule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Schedule not found');
    if (existing.userId !== userId) throw new ForbiddenException();
    await this.prisma.schedule.delete({ where: { id } });
    return { ok: true };
  }
}

