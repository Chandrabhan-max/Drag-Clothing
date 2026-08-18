import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { ManagerDashboardController } from './manager-dashboard.controller';
import { ManagerDashboardService } from './manager-dashboard.service';
import { Product } from 'src/entities';
import { ProductVariant } from 'src/entities';
import { Inventory } from 'src/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, Inventory]),
    CommonModule,
  ],
  controllers: [ManagerDashboardController],
  providers: [ManagerDashboardService],
  exports: [ManagerDashboardService],
})
export class ManagerDashboardModule {}
