import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../push/push.service';
import { EnvironmentService } from '../environment/environment.service';
import { MailService } from '../mail/mail.service';
import { format } from 'date-fns';

function parseTimeHHmm(time: string): { h: number; m: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(mm) || h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return { h, m: mm };
}

function scheduleDateTime(scheduleDate: Date, time: string) {
  const t = parseTimeHHmm(time);
  const d = new Date(scheduleDate);
  if (!t) return d;
  d.setHours(t.h, t.m, 0, 0);
  return d;
}

@Injectable()
export class NotificationJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
    private readonly env: EnvironmentService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  // Every minute: send reminders for schedules happening now.
  @Cron('* * * * *')
  async scheduleReminders() {
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setSeconds(0, 0);
    const windowEnd = new Date(windowStart.getTime() + 60_000);

    // Schedules store `date` as a date-only string (YYYY-MM-DD) serialized into DateTime.
    // That ends up near midnight UTC, so scanning a very narrow window can miss schedules.
    // Use a wider range and then match the exact minute by combining date+time below.
    const from = new Date(now.getTime() - 36 * 60 * 60_000);
    const to = new Date(now.getTime() + 36 * 60 * 60_000);

    const schedules = await this.prisma.schedule.findMany({
      where: { date: { gte: from, lte: to } },
      include: { user: true },
      take: 500,
    });

    // Fetch env once (Hanoi default). If you later add user locations, pass per-user coords.
    const [aqi, weather] = await Promise.all([
      this.env.aqi(String(21.0285), String(105.8542)),
      this.env.weather(String(21.0285), String(105.8542)),
    ]);

    for (const s of schedules) {
      const scheduledAt = scheduleDateTime(s.date, s.time);
      if (scheduledAt < windowStart || scheduledAt >= windowEnd) continue;

      // Deduplicate
      const exists = await this.prisma.scheduleReminder.findUnique({
        where: { scheduleId_scheduledAt: { scheduleId: s.id, scheduledAt } },
      });
      if (exists) continue;

      const threshold = Number(this.config.get<string>('AQI_INDOOR_THRESHOLD') ?? '100');
      const recommendIndoor = aqi.aqi > (Number.isFinite(threshold) ? threshold : 100);
      const title = 'FitAir';
      const message = recommendIndoor
        ? `トレーニング時間です: ${s.title}. AQI ${aqi.aqi}（${aqi.category}）のため、室内トレーニングをおすすめします。`
        : `トレーニング時間です: ${s.title}. 天気: ${weather.description ?? ''} ${weather.tempC.toFixed(1)}°C.`;

      const actionPath = recommendIndoor ? '/indoor' : '/search';

      const notification = await this.prisma.notification.create({
        data: {
          userId: s.userId,
          type: 'workout_reminder',
          title,
          message,
          data: {
            scheduleId: s.id,
            scheduledAt: scheduledAt.toISOString(),
            aqi,
            weather,
            action: { label: recommendIndoor ? '室内トレーニング' : '地図を見る', path: actionPath },
          },
        },
      });

      // eslint-disable-next-line no-console
      console.log('[Reminder] created', { userId: s.userId, scheduleId: s.id, scheduledAt: scheduledAt.toISOString(), notificationId: notification.id });

      await this.prisma.scheduleReminder.create({
        data: { scheduleId: s.id, scheduledAt, notificationId: notification.id },
      });

      // Push payload opens app and shows notification dialog
      await this.push.sendToUser(s.userId, {
        title: notification.title,
        body: notification.message,
        url: `/?notificationId=${encodeURIComponent(notification.id)}`,
        notificationId: notification.id,
        actions: [{ action: 'open', title: '開く' }],
      });

      // Also send email (Gmail SMTP) if configured.
      if (s.user?.email) {
        await this.mail.sendWorkoutReminder({
          to: s.user.email,
          title: s.title,
          message: `${message}\n\nFitAir を開く: http://localhost:3000/?notificationId=${notification.id}`,
        });
      }
    }
  }

  // Every 30 minutes: if AQI is bad, notify users once per day to prefer indoor training.
  @Cron('*/30 * * * *')
  async aqiIndoorAdvisory() {
    const today = format(new Date(), 'yyyy-MM-dd');

    const aqi = await this.env.aqi(String(21.0285), String(105.8542));
    const threshold = Number(this.config.get<string>('AQI_INDOOR_THRESHOLD') ?? '100');
    const th = Number.isFinite(threshold) ? threshold : 100;
    if (aqi.aqi <= th) return;

    const users = await this.prisma.user.findMany({
      select: { id: true, email: true },
      take: 2000,
    });

    for (const u of users) {
      const exists = await this.prisma.aqiAdvisory.findUnique({
        where: { userId_date: { userId: u.id, date: today } },
      });
      if (exists) continue;

      const title = 'FitAir';
      const message = `本日のAQIは ${aqi.aqi}（${aqi.category}）です。室内トレーニングをおすすめします。`;

      const notification = await this.prisma.notification.create({
        data: {
          userId: u.id,
          type: 'aqi_indoor_advisory',
          title,
          message,
          data: {
            aqi,
            action: { label: '室内トレーニング', path: '/indoor' },
          },
        },
      });

      await this.prisma.aqiAdvisory.create({
        data: { userId: u.id, date: today, aqi: aqi.aqi, category: aqi.category },
      });

      await this.push.sendToUser(u.id, {
        title: notification.title,
        body: notification.message,
        url: `/?notificationId=${encodeURIComponent(notification.id)}`,
        notificationId: notification.id,
        actions: [{ action: 'open', title: '開く' }],
      });

      if (u.email) {
        await this.mail.sendWorkoutReminder({
          to: u.email,
          title: '室内トレーニングのおすすめ',
          message: `${message}\n\nFitAir を開く: http://localhost:3000/?notificationId=${notification.id}`,
        });
      }
    }
  }
}
