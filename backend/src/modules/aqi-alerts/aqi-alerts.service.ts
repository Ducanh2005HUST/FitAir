import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../push/push.service';

type AqiReading = {
  provider: string;
  lat: number;
  lng: number;
  aqi: number;
  category: string;
  updatedAt: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
};

@Injectable()
export class AqiAlertsService {
  private lastSentAt = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async notifyAllUsersForReading(reading: AqiReading) {
    const threshold = Number(this.config.get<string>('AQI_INDOOR_THRESHOLD') ?? '40');
    const thresholdValue = Number.isFinite(threshold) ? threshold : 40;
    if (!Number.isFinite(reading.aqi) || reading.aqi <= thresholdValue) {
      return { ok: true as const, skipped: 'below_threshold' as const };
    }

    const throttleMs = Number(this.config.get<string>('AQI_ALERT_THROTTLE_MS') ?? '0');
    const now = Date.now();
    if (Number.isFinite(throttleMs) && throttleMs > 0 && now - this.lastSentAt < throttleMs) {
      return { ok: true as const, skipped: 'throttled' as const };
    }
    this.lastSentAt = now;

    const users = await this.prisma.user.findMany({
      select: { id: true, email: true },
      take: 5000,
    });

    const location = [reading.city, reading.state, reading.country].filter(Boolean).join(' / ');
    const placeText = location || `${reading.lat.toFixed(4)}, ${reading.lng.toFixed(4)}`;
    const message = `現在のAQIは ${reading.aqi}（${reading.category}）です。場所: ${placeText}。室内トレーニングをおすすめします。`;

    for (const user of users) {
      const notification = await this.prisma.notification.create({
        data: {
          userId: user.id,
          type: 'aqi_indoor_advisory',
          title: 'FitAir',
          message,
          data: {
            aqi: reading,
            source: 'environment_aqi_response',
            action: { label: '室内トレーニング', path: '/indoor' },
          },
        },
      });

      await this.push.sendToUser(user.id, {
        title: notification.title,
        body: notification.message,
        url: `/?notificationId=${encodeURIComponent(notification.id)}`,
        notificationId: notification.id,
        actions: [{ action: 'open', title: '開く' }],
      });

      if (user.email) {
        await this.mail.sendWorkoutReminder({
          to: user.email,
          title: 'AQI警告',
          message: `${message}\n\nFitAir を開く: http://localhost:3000/?notificationId=${notification.id}`,
        });
      }
    }

    return { ok: true as const, notified: users.length };
  }
}
