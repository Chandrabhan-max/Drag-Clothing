import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

import { ManagerReportsService } from './reports.service';

import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';
import { RolesGuard } from 'src/Modules/Auth/guards/roles.guard';
import { Roles } from 'src/Modules/Auth/decorator/roles.decorator';

import { Role } from 'src/common/enums/role.enum';

@Controller('manager/reports')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerReportsController {
  constructor(private readonly service: ManagerReportsService) {}

  @Get('products')
  async getProductReport(
    @Req() req,
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 10,
  ) {
    return this.service.getProductReport(
      req.user,
      Number(offset),
      Number(limit),
    );
  }

  @Get('inventory')
  async getInventoryReport(
    @Req() req,
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 10,
  ) {
    return this.service.getInventoryReport(
      req.user,
      Number(offset),
      Number(limit),
    );
  }

  @Get('sales')
  async getSalesReport(
    @Req() req,
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 10,
  ) {
    return this.service.getSalesReport(req.user, Number(offset), Number(limit));
  }

  @Get('revenue')
  async getRevenueReport(
    @Req() req,
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 10,
  ) {
    return this.service.getRevenueReport(
      req.user,
      Number(offset),
      Number(limit),
    );
  }
}
