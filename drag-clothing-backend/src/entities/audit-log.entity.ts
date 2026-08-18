import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ name: 'client_id', type: 'varchar', length: 36, nullable: true })
  clientId: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 100 })
  entity: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 36 })
  entityId: string;

  @Column({ name: 'old_value', type: 'json', nullable: true })
  oldValue: any;

  @Column({ name: 'new_value', type: 'json', nullable: true })
  newValue: any;

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
