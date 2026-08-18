import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuditModule } from 'src/Modules/Audit-log/audit-log.module';

@Module({
  imports: [CommonModule, AuditModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
