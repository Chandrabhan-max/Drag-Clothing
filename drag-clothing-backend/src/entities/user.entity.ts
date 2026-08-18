import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ length: 36, nullable: true, name: 'client_id' })
  clientId: string;

  @Column({ default: 'customer' })
  role: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'text', nullable: true, name: 'refresh_token' })
  refreshToken: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
