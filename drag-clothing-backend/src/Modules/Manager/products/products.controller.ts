import {
  Controller,
  Get,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ManagerProductsService } from './products.service';

import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';
import { RolesGuard } from 'src/Modules/Auth/guards/roles.guard';
import { Roles } from 'src/Modules/Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

import { UpdateProductDto } from '../Dto/update-product.dto';

@Controller('manager/products')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerProductsController {
  constructor(
    private readonly service: ManagerProductsService,
  ) {}

  @Get()
  async getAll(@Req() req: any) {
    return this.service.getProducts(
      req.user,
    );
  }

  @Get(':id')
  async getOne(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.service.getProduct(
      req.user,
      id,
    );
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.updateProduct(
      req.user,
      id,
      dto,
    );
  }

  @Delete(':id')
  async delete(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.service.deleteProduct(
      req.user,
      id,
    );
  }

  @Patch(':id/live')
  async setLive(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    dto: {
      isActive: boolean;
    },
  ) {
    return this.service.setProductLive(
      req.user,
      id,
      dto.isActive,
    );
  }
}