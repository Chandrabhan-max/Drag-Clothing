import { Controller, Get, Param, Post, Body, Put, Req, UseGuards, } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtGuard } from '../Auth/guards/jwt.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('orders')
@UseGuards(JwtGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @Roles(Role.CUSTOMER)
  createOrder(@Req() req: any) {
    console.log(req.user);
    return this.ordersService.createOrder(req.user);

  }

  @Get()
  @Roles(Role.CUSTOMER)
  getOrders(@Req() req: any) {
    return this.ordersService.getOrders(req.user.id);
  }

  @Get('client/my-orders')
  @Roles(Role.CLIENT)
  getClientOrders(@Req() req: any) {
    // 👇 Change req.user.id to req.user.clientId
    return this.ordersService.getClientOrders(req.user.clientId);
  }

  @Get('manager/my-orders')
  @Roles(Role.MANAGER)
  getManagerOrders(@Req() req: any) {
    return this.ordersService.getManagerOrders(req.user.id, req.user.clientId);
  }

  @Post('preview')
  @Roles(Role.CUSTOMER)
  previewOrder(@Req() req: any, @Body() body: { couponCode?: string }) {
    return this.ordersService.previewOrder(req.user.id, body.couponCode);
  }

  @Put(':id/cancel')
  @Roles(Role.CUSTOMER)
  cancelOrder(@Req() req: any, @Param('id') id: string) {
    return this.ordersService.cancelOrder(req.user, id);
  }

  @Put(':id/status')
  @Roles(Role.MANAGER, Role.CLIENT)
  updateStatus(@Req() req: any, @Param('id') id: string, @Body('status') status: string, @Body('trackingNumber') trackingNumber?: string, @Body('courierName') courierName?: string,) {
    return this.ordersService.updateOrderStatus(req.user, id, status, trackingNumber, courierName,);
  }

  @Get(':id')
  @Roles(Role.CUSTOMER, Role.MANAGER, Role.CLIENT)
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }
}
