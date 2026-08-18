import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ManagerDiscountsService } from './manager-discounts.service';
import { CreateManagerDiscountDto } from '../Dto/create-manager-discount.dto';
import { UpdateManagerDiscountDto } from '../Dto/update-manager-discount.dto';

import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';
import { RolesGuard } from 'src/Modules/Auth/guards/roles.guard';
import { Roles } from 'src/Modules/Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('manager/discounts')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerDiscountsController {
  constructor(private readonly service: ManagerDiscountsService) {}

  @Get()
  async getAll(@Req() req: any) {
    return this.service.getDiscounts(req.user);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateManagerDiscountDto) {
    return this.service.createDiscount(req.user, dto);
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateManagerDiscountDto,
  ) {
    return this.service.updateDiscount(req.user, id, dto);
  }

  @Delete(':id')
  async softDelete(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteDiscount(req.user, id);
  }

  @Patch(':id/restore')
  async restore(@Req() req: any, @Param('id') id: string) {
    return this.service.restoreDiscount(req.user, id);
  }

  @Delete(':id/permanent')
  async hardDelete(@Req() req: any, @Param('id') id: string) {
    return this.service.hardDeleteDiscount(req.user, id);
  }
}
