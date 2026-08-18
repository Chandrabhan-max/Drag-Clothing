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
import { CustomersService } from './customers.service';
import { JwtGuard } from '../Auth/guards/jwt.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('customers')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post('address')
  addAddress(@Req() req: any, @Body() body: any) {
    return this.customersService.addAddress({ ...body, userId: req.user.id });
  }

  @Get('dashboard/:userId')
  getDashboard(@Req() req: any) {
    return this.customersService.getDashboard(req.user.id);
  }

  @Get('notifications/:userId')
  getNotifications(@Req() req: any) {
    return this.customersService.getNotifications(req.user.id);
  }

  @Post('preview')
  previewOrder(@Req() req: any, @Body() body: { couponCode?: string }) {
    return this.customersService.previewOrder(req.user.id, body.couponCode);
  }

  @Get('address/:userId')
  getAddress(@Req() req: any) {
    return this.customersService.getAddress(req.user.id);
  }

  @Put('address/:id')
  updateAddress(@Param('id') id: string, @Body() body: any) {
    return this.customersService.updateAddress(id, body);
  }

  @Delete('address/:id')
  deleteAddress(@Param('id') id: string) {
    return this.customersService.deleteAddress(id);
  }

  @Get('profile/:userId')
  getProfile(@Req() req: any) {
    const customerId = req.user.id;
    return this.customersService.getProfile(customerId);
  }

  @Get(':customerId')
  getProfileById(@Req() req: any) {
    const customerId = req.user.id;
    return this.customersService.getProfile(customerId);
  }

  @Put('profile/:userId')
  updateProfile(@Req() req: any, @Body() body: any) {
    const customerId = req.user.id;
    return this.customersService.updateProfile(customerId, body);
  }

  @Put(':customerId')
  updateProfileById(@Req() req: any, @Body() body: any) {
    const customerId = req.user.id;
    return this.customersService.updateProfile(customerId, body);
  }
}
