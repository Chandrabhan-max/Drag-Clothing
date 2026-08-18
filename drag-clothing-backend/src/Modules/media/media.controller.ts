import {
  BadRequestException,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Req,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtGuard } from '../Auth/guards/jwt.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
@UseGuards(JwtGuard, RolesGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('products/:productId/images')
  @Roles(Role.CLIENT, Role.MANAGER)
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads/',
    }),
  )
  async createProductImage(
    @Req() req,
    @Param('productId') productId: string,
    @Body() dto: CreateProductImageDto,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      dto.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    }

    if (!dto?.imageUrl) {
      throw new BadRequestException(
        'Either imageUrl or file is required',
      );
    }

    return this.mediaService.createProductImage(req.user, productId, dto);
  }

  @Get('products/:productId/images')
  async getProductImages(@Req() req, @Param('productId') productId: string) {
    return this.mediaService.getProductImages(req.user, productId);
  }

  @Get('images/:id')
  async getImageById(@Req() req, @Param('id') id: string) {
    return this.mediaService.getImageById(req.user, id);
  }

  @Put('images/:id')
  @Roles(Role.CLIENT, Role.MANAGER)
  async updateImage(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateProductImageDto,
  ) {
    return this.mediaService.updateImage(req.user, id, dto);
  }

  @Delete('images/:id')
  @Roles(Role.CLIENT, Role.MANAGER)
  async deleteImage(@Req() req, @Param('id') id: string) {
    return this.mediaService.deleteImage(req.user, id);
  }
}
