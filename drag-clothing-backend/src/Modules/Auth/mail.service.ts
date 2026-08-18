import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendOtp(email: string, otp: string): Promise<void> {
    const host = this.config.get<string>('SMTP_HOST')?.trim();
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER')?.trim();
    const pass = (this.config.get<string>('SMTP_PASS') ?? '').replace(
      /\s+/g,
      '',
    );
    const from = (this.config.get<string>('SMTP_FROM') ?? user ?? '').trim();

    if (!host || !user || !pass || !from) {
      throw new BadRequestException('SMTP config is missing in .env');
    }

    if (host.includes('@')) {
      throw new BadRequestException(
        'SMTP_HOST must be an SMTP server (example: smtp.gmail.com), not an email',
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    try {
      await transporter.sendMail({
        from,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is ${otp}`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown SMTP error';
      this.logger.error(`Failed to send OTP to ${email}: ${message}`);
      throw new BadRequestException(`Failed to send OTP email: ${message}`);
    }
  }
}
