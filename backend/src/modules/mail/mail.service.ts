import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService) {}

  private transporter() {
    const host = this.config.get<string>('SMTP_HOST') ?? '';
    const port = Number(this.config.get<string>('SMTP_PORT') ?? '587');
    const user = this.config.get<string>('SMTP_USER') ?? '';
    const pass = this.config.get<string>('SMTP_PASS') ?? '';

    if (!host || !user || !pass) return null;

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendPasswordResetCode(input: { to: string; code: string }) {
    const from = this.config.get<string>('SMTP_FROM') ?? '';
    const tx = this.transporter();
    if (!from || !tx) {
      // Don’t leak config values; just fail gracefully.
      return { ok: false as const, message: 'Email is not configured' };
    }

    await tx.sendMail({
      from,
      to: input.to,
      subject: 'FitAir - Password reset code',
      text: `Your FitAir password reset code is: ${input.code}\nThis code expires in 10 minutes.`,
    });
    return { ok: true as const };
  }
}

