import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from 'src/entities';
import { AuditService } from './audit-log.service';
import { CommonModule } from 'src/common/common.module';
import { AdminAuditController } from './audit-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), CommonModule],
  providers: [AuditService],
  controllers: [AdminAuditController],
  exports: [AuditService],
})
export class AuditModule {}
