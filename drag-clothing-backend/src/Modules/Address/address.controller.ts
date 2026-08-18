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
import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Controller('address')
@UseGuards(JwtGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  add(@Req() req, @Body() dto: CreateAddressDto) {
    return this.addressService.addAddress(req.user, dto);
  }

  @Get()
  getMyAddresses(@Req() req) {
    return this.addressService.getMyAddresses(req.user);
  }

  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.addressService.deleteAddress(req.user, id);
  }
}
