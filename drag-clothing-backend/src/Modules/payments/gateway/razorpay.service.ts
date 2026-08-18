import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(private readonly configService: ConfigService) {
    this.keyId =
      this.configService.get<string>('RAZORPAY_KEY_ID') ?? '';

    this.keySecret =
      this.configService.get<string>('RAZORPAY_KEY_SECRET') ?? '';

    if (!this.keyId || !this.keySecret) {
      throw new Error(
        'Missing Razorpay keys: RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET',
      );
    }

    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  async createOrder(amount: number, receipt: string) {
    return this.razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt,
      notes: {
        app_order_id: receipt,
      },
    });
  }
}