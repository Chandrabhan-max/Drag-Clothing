import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ClientVariantsService } from './client-variants.service';
import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';
import { RolesGuard } from 'src/Modules/Auth/guards/roles.guard';
import { Roles } from 'src/Modules/Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateVariantDto } from '../Dto/create-variant.dto';
import { UpdateVariantDto } from '../Dto/update-variant.dto';

@Controller('client/product-variants')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.CLIENT)
export class ClientVariantsController {
  constructor(private readonly variantsService: ClientVariantsService) {}

  @Post()
  async createVariant(@Req() req, @Body() dto: CreateVariantDto) {
    return this.variantsService.createVariant(req.user, dto);
  }

  @Get(':productId')
  async getVariantsByProduct(
    @Req() req,
    @Param('productId') productId: string,
  ) {
    return this.variantsService.getVariantsByProduct(req.user, productId);
  }

  @Put(':id')
  async updateVariant(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.variantsService.updateVariant(req.user, id, dto);
  }

  // Soft Delete (Move to Bin)
  @Delete(':id')
  async deleteVariant(@Req() req, @Param('id') id: string) {
    return this.variantsService.deleteVariant(req.user, id);
  }

  // Restore from Bin
  @Patch(':id/restore')
  async restoreVariant(@Req() req, @Param('id') id: string) {
    return this.variantsService.restoreVariant(req.user, id);
  }

  @Delete(':id/permanent')
  async hardDeleteVariant(@Req() req, @Param('id') id: string) {
    return this.variantsService.hardDeleteVariant(req.user, id);
  }
}
