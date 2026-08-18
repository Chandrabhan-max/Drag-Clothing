import { CommonModule } from 'src/common/common.module';
import { ManagerProductsModule } from './products/products.module';
import { Module } from '@nestjs/common';
import { ProductVariantsModule } from './product-variants/product-variants.module';
import { ManagerInventoryModule } from './inventory/inventory.module';
import { ManagerReportsModule } from './reports/reports.module';
import { ManagerDashboardModule } from './Dashboard/manager-dashboard.module';
import { ManagerDiscountsModule } from './discount/manager-discounts.module';
@Module({
  imports: [
    CommonModule,
    ManagerProductsModule,
    ProductVariantsModule,
    ManagerInventoryModule,
    ManagerReportsModule,
    ManagerDashboardModule,
    ManagerDiscountsModule
  ],
})
export class ManagerModule {}
