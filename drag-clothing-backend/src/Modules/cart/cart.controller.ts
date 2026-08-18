import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtGuard } from '../Auth/guards/jwt.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('cart')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  addToCart(@Req() req: any, @Body() body: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, body);
  }

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Put('update/:id')
  updateCart(@Param('id') id: string, @Body() body: UpdateCartDto) {
    return this.cartService.updateCart(id, body);
  }

  @Get('count')
  getCartCount(@Req() req: any) {
    return this.cartService.getCartCount(req.user.id);
  }

  @Post('validate')
  validateCart(@Req() req: any) {
    return this.cartService.validateCart(req.user.id);
  }

  @Delete('remove/:id')
  removeItem(@Param('id') id: string) {
    return this.cartService.removeItem(id);
  }

  @Delete('clear')
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}
