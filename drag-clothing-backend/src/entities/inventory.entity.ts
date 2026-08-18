import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', length: 36 })
  clientId: string;

  @Column({ name: 'manager_id', length: 36 })
  managerId: string;

  @Column({ name: 'product_id', length: 36 })
  productId: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
