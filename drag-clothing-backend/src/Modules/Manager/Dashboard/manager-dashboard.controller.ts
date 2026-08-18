import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ManagerDashboardService } from './manager-dashboard.service';
import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';
import { RolesGuard } from 'src/Modules/Auth/guards/roles.guard';
import { Roles } from 'src/Modules/Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('manager/dashboard')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerDashboardController {
  constructor(private readonly dashboardService: ManagerDashboardService) {}

  @Get()
  async getDashboard(@Req() req: any) {
    return this.dashboardService.getDashboard(req.user);
  }
}
