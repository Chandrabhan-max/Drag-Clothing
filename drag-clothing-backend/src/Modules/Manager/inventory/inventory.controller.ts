import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ManagerInventoryService } from './inventory.service';
import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';
import { RolesGuard } from 'src/Modules/Auth/guards/roles.guard';
import { Roles } from 'src/Modules/Auth/decorator/roles.decorator';

import { Role } from 'src/common/enums/role.enum';

@Controller('manager/inventory')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerInventoryController {
  constructor(private readonly service: ManagerInventoryService) {}

  @Get()
  async getInventory(@Req() req) {
    return this.service.getInventory(req.user);
  }

  @Get(':id')
  async getInventoryItem(@Req() req, @Param('id') id: string) {
    return this.service.getInventoryItem(req.user, id);
  }

  @Patch(':id/update-stock')
  async updateStock(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: { quantity: number },
  ) {
    return this.service.updateStock(req.user, id, dto.quantity);
  }
}
