import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';
import { RolesGuard } from 'src/Modules/Auth/guards/roles.guard';
import { Roles } from 'src/Modules/Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('admin')
@Roles(Role.SUPER_ADMIN)
@UseGuards(JwtGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    return this.dashboardService.getDashboard(req.user);
  }
}
