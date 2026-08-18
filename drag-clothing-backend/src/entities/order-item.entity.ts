import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', length: 36 })
  orderId: string;

  @Column({ name: 'product_id', length: 36 })
  productId: string;

  @Column({ name: 'variant_id', length: 36 })
  variantId: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}
