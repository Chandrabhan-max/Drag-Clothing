import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', length: 36 })
  productId: string;

  @Column({ length: 50 })
  size: string;

  @Column({ length: 50 })
  color: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'created_by', length: 36 })
  createdBy: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
