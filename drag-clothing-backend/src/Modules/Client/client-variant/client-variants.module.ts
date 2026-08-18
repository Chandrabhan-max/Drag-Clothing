import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from 'src/entities/product-variant.entity'; // Make sure path is correct
import { ClientVariantsController } from './client-variants.controller';
import { ClientVariantsService } from './client-variants.service';
import { AuditModule } from 'src/Modules/Audit-log/audit-log.module';
import { CommonModule } from 'src/common/common.module'; // Import your CommonModule

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductVariant]), // Matches your DiscountModule pattern
    CommonModule, // Provides ApiResponseService
    AuditModule, // Provides AuditService
  ],
  controllers: [ClientVariantsController],
  providers: [ClientVariantsService],
  exports: [ClientVariantsService],
})
export class ClientVariantsModule {}
