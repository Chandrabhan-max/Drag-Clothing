import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from '../../entities/cart.entity';
import { Product } from '../../entities/product.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Product]), CommonModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
