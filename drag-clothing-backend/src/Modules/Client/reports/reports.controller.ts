import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { ReportsService } from './reports.service';

import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';
import { RolesGuard } from 'src/Modules/Auth/guards/roles.guard';
import { Roles } from 'src/Modules/Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('client/reports')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.CLIENT)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  async getSummary(@Req() req: any) {
    return this.reportsService.getSummary(req.user);
  }

  @Get('products')
  async getProductReport(@Req() req: any) {
    console.log('🔥 PRODUCTS ROUTE HIT');

    return this.reportsService.getProductReport(req.user);
  }

  @Get('managers')
  async getManagerReport(@Req() req: any) {
    return this.reportsService.getManagerReport(req.user);
  }
}
