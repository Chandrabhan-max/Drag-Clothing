import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', length: 36 })
  clientId: string;

  @Column({ name: 'product_id', length: 36 })
  productId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage: number;

  @Column({ name: 'start_date', type: 'datetime' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'datetime' })
  endDate: Date;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
