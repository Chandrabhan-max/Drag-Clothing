import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', length: 36 })
  productId: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
