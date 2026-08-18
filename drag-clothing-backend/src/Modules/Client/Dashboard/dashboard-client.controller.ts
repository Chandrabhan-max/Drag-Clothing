import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ClientDashboardService } from './dashboard-client.service';

import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';

import { RolesGuard } from 'src/Modules/Auth/guards/roles.guard';

import { Roles } from 'src/Modules/Auth/decorator/roles.decorator';

import { Role } from 'src/common/enums/role.enum';


@Controller('client/dashboard')

@UseGuards(
  JwtGuard,
  RolesGuard,
)

@Roles(Role.CLIENT)

export class ClientDashboardController {

  constructor(
    private readonly dashboardService: ClientDashboardService,
  ) {}


  @Get()
  async getDashboard(
    @Req() req: any,
  ) {

    return this.dashboardService.getDashboard(
      req.user,
    );

  }

}