import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', length: 36 })
  userId: string;

  @Column({ type: 'varchar', name: 'manager_id', length: 36, nullable: true })
  managerId: string | null;

  @Column({ name: 'client_id', length: 36 })
  clientId: string;

  @Column({ name: 'address_id', length: 36 })
  addressId: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'returned',
    ],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'varchar', name: 'tracking_number', nullable: true })
  trackingNumber: string | null;

  @Column({ type: 'varchar', name: 'courier_name', nullable: true })
  courierName: string | null;

  @Column({ type: 'timestamp', name: 'shipped_at', nullable: true })
  shippedAt: Date | null;

  @Column({ type: 'timestamp', name: 'delivered_at', nullable: true })
  deliveredAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
