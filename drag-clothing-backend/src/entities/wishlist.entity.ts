import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('wishlist')
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', length: 36 })
  userId: string;

  @Column({ name: 'product_id', length: 36 })
  productId: string;

  @Column({ type: 'varchar', name: 'variant_id', length: 36, nullable: true })
  variantId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
