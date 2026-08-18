import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';

import { ManagerDiscountsController } from './manager-discounts.controller';
import { ManagerDiscountsService } from './manager-discounts.service';

import { AuditService } from 'src/Modules/Audit-log/audit-log.service';

@Module({
  imports: [
    CommonModule,
  ],

  controllers: [
    ManagerDiscountsController,
  ],

  providers: [
    ManagerDiscountsService,
    AuditService,
  ],

  exports: [
    ManagerDiscountsService,
  ],
})
export class ManagerDiscountsModule {}