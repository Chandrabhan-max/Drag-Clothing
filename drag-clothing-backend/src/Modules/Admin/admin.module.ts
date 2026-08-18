import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, Client } from 'src/entities';
import { CommonModule } from 'src/common/common.module';
import { DashboardModule } from './Dashboard/dashboard.module';
import { AuditModule } from '../Audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Client]),
    CommonModule,
    DashboardModule,
    AuditModule,
  ],

  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
