import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductType } from 'src/common/enums/product-type.enum';
import { Gender } from 'src/common/enums/gender.enum';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', length: 36 })
  clientId: string;

  @Column({ name: 'category_id', length: 36 })
  categoryId: string;

  @Column({ type: 'enum', enum: ProductType })
  type: ProductType;

  @Column({ type: 'enum', enum: Gender, default: Gender.UNISEX })
  gender: Gender;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ name: 'created_by', length: 36 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
