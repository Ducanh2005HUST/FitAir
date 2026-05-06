import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import webPush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private vapidPublicKey() {
    return (this.config.get<string>('VAPID_PUBLIC_KEY') ?? '').trim();
  }

  private vapidPrivateKey() {
    return (this.config.get<string>('VAPID_PRIVATE_KEY') ?? '').trim();
  }

  private vapidSubject() {
    return (this.config.get<string>('VAPID_SUBJECT') ?? 'mailto:no-reply@fitair.local').trim();
  }

  private configured() {
    return Boolean(this.vapidPublicKey() && this.vapidPrivateKey());
  }

  private ensureConfigured() {
    if (!this.configured()) return false;
    webPush.setVapidDetails(this.vapidSubject(), this.vapidPublicKey(), this.vapidPrivateKey());
    return true;
  }

  publicKey() {
    return { publicKey: this.vapidPublicKey() };
  }

  async upsertSubscription(
    userId: string,
    body: { endpoint: string; keys: { p256dh: string; auth: string }; userAgent?: string },
  ) {
    if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) return { ok: false };
    await this.prisma.pushSubscription.upsert({
      where: { userId_endpoint: { userId, endpoint: body.endpoint } },
      update: { p256dh: body.keys.p256dh, auth: body.keys.auth, userAgent: body.userAgent ?? null },
      create: {
        userId,
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        userAgent: body.userAgent ?? null,
      },
    });
    return { ok: true };
  }

  async removeSubscription(userId: string, endpoint: string) {
    if (!endpoint) return { ok: true };
    await this.prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
    return { ok: true };
  }

  async sendToUser(userId: string, payload: { title: string; body: string; url?: string; notificationId?: string; actions?: any[] }) {
    if (!this.ensureConfigured()) return { ok: false, reason: 'VAPID not configured' } as const;

    const subs = await this.prisma.pushSubscription.findMany({ where: { userId }, take: 20 });
    const msg = JSON.stringify(payload);

    for (const s of subs) {
      try {
        await webPush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          } as any,
          msg,
        );
      } catch (e: any) {
        const status = e?.statusCode;
        // remove dead subscriptions
        if (status === 404 || status === 410) {
          await this.prisma.pushSubscription.deleteMany({ where: { userId, endpoint: s.endpoint } });
        }
      }
    }
    return { ok: true } as const;
  }
}

