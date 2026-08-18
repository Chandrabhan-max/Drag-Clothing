import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ManagerProductVariantsService } from './product-variants.service';
import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';
import { RolesGuard } from 'src/Modules/Auth/guards/roles.guard';
import { Roles } from 'src/Modules/Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { UpdateProductVariantDto } from '../Dto/update-product-variant.dto';
import { CreateProductVariantDto } from '../Dto/create-product-variant.dto';

@Controller('manager/product-variants')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerProductVariantsController {
  constructor(private readonly service: ManagerProductVariantsService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateProductVariantDto) {
    return this.service.createVariant(req.user, dto);
  }

  @Get(':productId')
  async getByProduct(@Req() req, @Param('productId') productId: string) {
    return this.service.getVariants(req.user, productId);
  }

  @Put(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.service.updateVariant(req.user, id, dto);
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    return this.service.deleteVariant(req.user, id);
  }

  @Patch(':id/restore')
  async restore(@Req() req, @Param('id') id: string) {
    return this.service.restoreVariant(req.user, id);
  }

  @Patch(':id/update-stock')
  async updateStock(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: { stock: number },
  ) {
    return this.service.updateStock(req.user, id, dto.stock);
  }
}
