import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import {
  Order,
  Payment,
  OrderItem,
  ProductVariant,
} from 'src/entities';
import { RazorpayService } from './gateway/razorpay.service';
import { PaymentVerificationService } from './verification/payment-verification.service';

@Injectable()
export class PaymentsService {
  private readonly webhookSecret: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly razorpayService: RazorpayService,
    private readonly paymentVerificationService: PaymentVerificationService,
  ) {
    this.webhookSecret =
      this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') ??
      this.configService.get<string>('RAZORPAY_KEY_SECRET') ??
      '';
  }

  async createGatewayOrder(orderId: string) {
    const orderRepo = this.dataSource.getRepository(Order);
    const paymentRepo = this.dataSource.getRepository(Payment);
    const order = await orderRepo.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const razorOrder = await this.razorpayService.createOrder(
      Number(order.totalAmount) * 100,
      order.id,
    );

    const existingPayment = await paymentRepo.findOne({ where: { orderId: order.id } });

    if (!existingPayment) {
      const pendingPayment = paymentRepo.create({
        orderId: order.id,
        userId: order.userId,
        amount: Number(order.totalAmount),
        method: 'razorpay',
        status: 'created',
        transactionId: razorOrder.id,
      });

      await paymentRepo.save(pendingPayment);
    } else {
      existingPayment.amount = Number(order.totalAmount);
      existingPayment.method = 'razorpay';
      existingPayment.status = 'created';
      existingPayment.transactionId = razorOrder.id;

      await paymentRepo.save(existingPayment);
    }

    return razorOrder;
  }

  async verifyGatewayPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    appOrderId?: string,
  ) {
    const isValid = this.paymentVerificationService.verifySignature(
      orderId,
      paymentId,
      signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    await this.markPaymentSuccess({
      appOrderId,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
    });

    return { verified: true };
  }

  async handleWebhook(rawBody: string, signature: string) {
    if (!this.webhookSecret) {
      throw new BadRequestException('Webhook secret is not configured');
    }

    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    const generated = this.paymentVerificationService.generateHmac(rawBody, this.webhookSecret);
    if (generated !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const payload = JSON.parse(rawBody) as any;
    const event = payload?.event as string | undefined;

    if (event === 'payment.captured') {
      await this.markPaymentSuccess({
        appOrderId: this.extractAppOrderId(payload),
        razorpayOrderId: payload?.payload?.payment?.entity?.order_id,
        razorpayPaymentId: payload?.payload?.payment?.entity?.id,
      });
    }

    if (event === 'payment.failed') {
      await this.markPaymentFailed({
        appOrderId: this.extractAppOrderId(payload),
        razorpayOrderId: payload?.payload?.payment?.entity?.order_id,
        razorpayPaymentId: payload?.payload?.payment?.entity?.id,
      });
    }

    return { received: true, event };
  }

  private extractAppOrderId(payload: any): string | undefined {
    const fromNotes = payload?.payload?.payment?.entity?.notes?.app_order_id;
    const fromOrderReceipt = payload?.payload?.order?.entity?.receipt;

    return fromNotes ?? fromOrderReceipt;
  }

  private async markPaymentSuccess(params: {
    appOrderId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  }) {
    const paymentRepo = this.dataSource.getRepository(Payment);
    const orderRepo = this.dataSource.getRepository(Order);

    const payment = await this.resolvePaymentRecord(params.appOrderId, params.razorpayOrderId);
    if (!payment) {
      return;
    }

    if (payment.status !== 'paid' || payment.transactionId !== params.razorpayPaymentId) {
      payment.status = 'paid';
      payment.method = 'razorpay';
      if (params.razorpayPaymentId) 
      {
        payment.transactionId = params.razorpayPaymentId;
      }
      await paymentRepo.save(payment);
    }

    const order = await orderRepo.findOne({ where: { id: payment.orderId } });
    if (order && order.status === 'pending') {
      order.status = 'confirmed';
      await orderRepo.save(order);
    }
  }

  private async markPaymentFailed(params: {
  appOrderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}) {
  const paymentRepo =
    this.dataSource.getRepository(Payment);

  const orderRepo =
    this.dataSource.getRepository(Order);

  const payment =
    await this.resolvePaymentRecord(
      params.appOrderId,
      params.razorpayOrderId,
    );

  if (!payment || payment.status === 'paid') {
    return;
  }

  payment.status = 'failed';
  payment.method = 'razorpay';

  if (params.razorpayPaymentId) {
    payment.transactionId =
      params.razorpayPaymentId;
  }

  await paymentRepo.save(payment);

  // =====================================================
  // CANCEL PENDING ORDER
  // =====================================================

  const order = await orderRepo.findOne({
    where: {
      id: payment.orderId,
    },
  });

  if (!order || order.status !== 'pending') {
    return;
  }

  // =====================================================
  // RESTORE STOCK
  // =====================================================

  const orderItems =
    await this.dataSource
      .getRepository(Order)
      .manager
      .createQueryBuilder(OrderItem, 'item')
      .where(
        'item.orderId = :orderId',
        {
          orderId: order.id,
        },
      )
      .getMany();

  for (const item of orderItems) {
    if (!item.variantId || !item.quantity) {
      continue;
    }

    await this.dataSource
      .createQueryBuilder()
      .update(ProductVariant)
      .set({
        stock: () =>
          `stock + ${Number(item.quantity)}`,
      })
      .where(
        'id = :variantId',
        {
          variantId:
            item.variantId,
        },
      )
      .execute();
  }

  order.status = 'cancelled';

  await orderRepo.save(order);
}

  private async resolvePaymentRecord(appOrderId?: string, razorpayOrderId?: string) {
    const paymentRepo = this.dataSource.getRepository(Payment);

    if (appOrderId) {
      const byOrder = await paymentRepo.findOne({ where: { orderId: appOrderId } });
      if (byOrder) {
        return byOrder;
      }
    }

    if (razorpayOrderId) {
      return paymentRepo.findOne({ where: { transactionId: razorpayOrderId } });
    }

    return null;
  }

}

