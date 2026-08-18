import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { AuditModule } from 'src/Modules/Audit-log/audit-log.module';

import { ManagerProductsController } from './products.controller';
import { ManagerProductsService } from './products.service';

@Module({
  imports: [CommonModule, AuditModule],
  controllers: [ManagerProductsController],
  providers: [ManagerProductsService],
  exports: [ManagerProductsService],
})
export class ManagerProductsModule {}
