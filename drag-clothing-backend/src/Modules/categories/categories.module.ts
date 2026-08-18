import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { AuditModule } from '../Audit-log/audit-log.module';

@Module({
  imports: [
    CommonModule, // Imports your ApiResponseService
    AuditModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
