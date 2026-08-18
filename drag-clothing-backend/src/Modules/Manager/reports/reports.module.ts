import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ManagerReportsController } from './reports.controller';
import { ManagerReportsService } from './reports.service';

@Module({
  imports: [CommonModule],
  controllers: [ManagerReportsController],
  providers: [ManagerReportsService],
  exports: [ManagerReportsService],
})
export class ManagerReportsModule {}
