import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from 'src/entities';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { CommonModule } from 'src/common/common.module';
import { AuditModule } from 'src/Modules/Audit-log/audit-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory]), CommonModule, AuditModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
