import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', length: 36 })
  userId: string;

  @Column({ name: 'product_id', length: 36 })
  productId: string;

  @Column('int')
  rating: number;

  @Column('text')
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
