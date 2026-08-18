import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import {
  ClientDashboardController,
} from './dashboard-client.controller';

import {
  ClientDashboardService,
} from './dashboard-client.service';

import {
  Product,
  Inventory,
  Order,
  User,
} from 'src/entities';

import { CommonModule } from 'src/common/common.module';


@Module({

  imports: [

    TypeOrmModule.forFeature([
      Product,
      Inventory,
      Order,
      User,
    ]),

    CommonModule,

  ],

  controllers: [
    ClientDashboardController,
  ],

  providers: [
    ClientDashboardService,
  ],

  exports: [
    ClientDashboardService,
  ],

})
export class ClientDashboardModule {}