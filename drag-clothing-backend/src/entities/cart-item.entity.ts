import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cart_id', length: 36 })
  cartId: string;

  @Column({ name: 'product_id', length: 36 })
  productId: string;

  @Column({ name: 'variant_id', length: 36 })
  variantId: string;

  @Column('int')
  quantity: number;
}
