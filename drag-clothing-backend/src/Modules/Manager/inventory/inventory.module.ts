import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ManagerInventoryController } from './inventory.controller';
import { ManagerInventoryService } from './inventory.service';
import { AuditModule } from 'src/Modules/Audit-log/audit-log.module';

@Module({
  imports: [CommonModule, AuditModule],
  controllers: [ManagerInventoryController],
  providers: [ManagerInventoryService],
  exports: [ManagerInventoryService],
})
export class ManagerInventoryModule {}
