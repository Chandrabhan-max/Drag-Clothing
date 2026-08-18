import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { AuditModule } from 'src/Modules/Audit-log/audit-log.module';

import { ManagersController } from './managers.controller';
import { ManagersService } from './managers.service';

@Module({
  imports: [CommonModule, AuditModule],
  controllers: [ManagersController],
  providers: [ManagersService],
  exports: [ManagersService],
})
export class ManagersModule {}
