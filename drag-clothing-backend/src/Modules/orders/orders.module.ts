import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

import { Order } from 'src/entities';
import { OrderItem } from 'src/entities';
import { Cart } from 'src/entities';
import { Product } from 'src/entities';
import { CommonModule } from 'src/common/common.module';
import { AuditModule } from 'src/Modules/Audit-log/audit-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Cart, Product]), CommonModule, AuditModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
