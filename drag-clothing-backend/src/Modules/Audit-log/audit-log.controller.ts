import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../Auth/guards/jwt.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuditService } from './audit-log.service';

@Controller('admin/audit')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class AdminAuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  getLogs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.auditService.getAuditLogs({
      startDate,
      endDate,
      page: Number(page),
      limit: Number(limit),
    });
  }
}
