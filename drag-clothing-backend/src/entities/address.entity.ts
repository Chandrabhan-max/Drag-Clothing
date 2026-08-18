import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', length: 36 })
  userId: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  phone: string;

  @Column({ name: 'address_line1' })
  addressLine1: string;

  @Column({ name: 'address_line2', nullable: true })
  addressLine2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ name: 'postal_code' })
  postalCode: string;

  @Column()
  country: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
