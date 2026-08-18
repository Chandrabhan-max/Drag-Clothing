import { Module } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { PaymentsController } from './payments.controller';
import { CommonModule } from 'src/common/common.module';
import { RazorpayService } from './gateway/razorpay.service';
import { PaymentVerificationService } from './verification/payment-verification.service';

@Module({
  imports: [CommonModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, RazorpayService, PaymentVerificationService],
})
export class PaymentsModule {}
