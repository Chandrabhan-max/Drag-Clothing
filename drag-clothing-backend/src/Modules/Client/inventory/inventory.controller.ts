import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';
import { DistributeInventoryDto } from '../Dto/distribute-inventory.dto';
import { Roles } from 'src/Modules/Auth/decorator/roles.decorator';
import { RolesGuard } from 'src/Modules/Auth/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';

@Controller('client/inventory')
@Roles(Role.CLIENT)
@UseGuards(JwtGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('distribute')
  async distributeStock(@Req() req, @Body() dto: DistributeInventoryDto) {
    return await this.inventoryService.distributeStock(req.user, dto);
  }

  @Get()
  async getClientInventory(@Req() req) {
    return await this.inventoryService.getClientInventory(req.user);
  }

  @Get(':productId')
  async getProductInventory(@Req() req, @Param('productId') productId: string) {
    return await this.inventoryService.getProductInventory(req.user, productId);
  }

  @Delete(':inventoryId')
  async deleteInventory(@Req() req, @Param('inventoryId') inventoryId: string) {
    return await this.inventoryService.deleteInventory(req.user, inventoryId);
  }
}
