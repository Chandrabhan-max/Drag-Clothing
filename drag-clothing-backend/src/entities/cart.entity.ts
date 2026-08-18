import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', length: 36 })
  userId: string;

  // Added to align Cart entity with cart/order service usage.
  @Column({ name: 'product_id', length: 36 })
  productId: string;

  @Column({ type: 'varchar', name: 'variant_id', length: 36, nullable: true })
  variantId: string | null;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
