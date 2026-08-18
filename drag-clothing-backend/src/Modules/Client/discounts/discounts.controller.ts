import { Controller, Post, Get, Put, Delete, Patch, Body, Req, Param, UseGuards } from '@nestjs/common';
import { DiscountService } from './discounts.service';
import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';
import { RolesGuard } from 'src/Modules/Auth/guards/roles.guard';
import { Roles } from 'src/Modules/Auth/decorator/roles.decorator';
import { CreateDiscountDto } from '../Dto/create-discount.dto';
import { Role } from 'src/common/enums/role.enum';

@Controller('client')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.CLIENT)
export class DiscountController {

  constructor(private readonly discountService: DiscountService,) {}

  @Post('discounts')
  async createDiscount( @Req() req, @Body() dto: CreateDiscountDto,) {
    return await this.discountService.createDiscount(req.user,dto,);
  }


  @Get('discounts')
async getClientDiscounts(@Req() req,) {
  return await this.discountService.getClientDiscounts(req.user,);
}


@Put('discounts/:id')
async updateDiscount(@Req() req, @Param('id') id: string,@Body() dto: any,) {
  return await this.discountService.updateDiscount(req.user,id,dto,);
}

@Patch('discounts/:id/restore')
  async restoreDiscount(@Req() req, @Param('id') id: string) {
    return await this.discountService.restoreDiscount(req.user, id);
  }

@Delete('discounts/:id')
async deleteDiscount(@Req() req,@Param('id') id: string,){
  return await this.discountService.deleteDiscount(req.user,id,);
}

@Delete('discounts/:id/permanent')
async permanentdelete(@Req() req,@Param('id')id:string){
return await this.discountService.permaDelDiscount(req.user,id)
}

}
