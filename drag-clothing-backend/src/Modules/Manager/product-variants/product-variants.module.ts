import { Module } from '@nestjs/common';
import { ManagerProductVariantsController } from './product-variants.controller';
import { ManagerProductVariantsService } from './product-variants.service';
import { CommonModule } from 'src/common/common.module';
import { AuditModule } from 'src/Modules/Audit-log/audit-log.module';

@Module({
  imports: [CommonModule, AuditModule],
  controllers: [ManagerProductVariantsController],
  providers: [ManagerProductVariantsService],
})
export class ProductVariantsModule {}
