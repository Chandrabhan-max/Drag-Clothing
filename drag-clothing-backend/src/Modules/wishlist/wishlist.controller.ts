import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtGuard } from '../Auth/guards/jwt.guard';
import { Roles } from '../Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from '../Auth/guards/roles.guard';

@Controller('wishlist')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post('items')
  add(@Req() req: any, @Body() body: { productId: string; variantId: string }) {
    return this.wishlistService.addToWishlist(
      req.user.id,
      body.productId,
      body.variantId,
    );
  }

  @Get()
  getWishlist(@Req() req: any) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  @Delete('items/:id')
  removeItem(@Param('id') id: string) {
    return this.wishlistService.removeItem(id);
  }

  @Post('move-to-cart/:id')
  moveToCart(@Param('id') id: string) {
    return this.wishlistService.moveToCart(id);
  }

  @Get('count/:userId')
  getWishlistCount(@Req() req: any) {
    return this.wishlistService.getWishlistCount(req.user.id);
  }
}
