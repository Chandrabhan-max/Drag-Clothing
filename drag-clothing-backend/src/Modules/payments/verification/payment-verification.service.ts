import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PaymentVerificationService {
  private readonly keySecret: string;

  constructor(private readonly configService: ConfigService) {
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') ?? '';

    if (!this.keySecret) {
      throw new Error('Missing Razorpay key: RAZORPAY_KEY_SECRET');
    }
  }

  verifySignature(orderId: string,paymentId: string,signature: string,): boolean {

    const generated = this.generateHmac(orderId + "|" + paymentId, this.keySecret);

    return generated === signature;
  }
  generateHmac(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

}
