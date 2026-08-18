import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', length: 36 })
  orderId: string;

  @Column({ name: 'user_id', length: 36 })
  userId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  method: string;

  @Column()
  status: string;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
