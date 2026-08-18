import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Req,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ManagersService } from './managers.service';
import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';
import { RolesGuard } from 'src/Modules/Auth/guards/roles.guard';
import { Roles } from 'src/Modules/Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateManagerDto } from '../Dto/create-manager.dto';
import { UpdateManagerDto } from '../Dto/update-manager.dto';

@Controller('client/managers')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.CLIENT)
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Post()
  async createManager(@Req() req, @Body() dto: CreateManagerDto) {
    return this.managersService.createManager(req.user, dto);
  }

  @Get()
  async getManagers(@Req() req) {
    return this.managersService.getManagers(req.user);
  }

  @Put(':id')
  async updateManager(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateManagerDto,
  ) {
    return this.managersService.updateManager(req.user, id, dto);
  }

  @Delete(':id')
  async deleteManager(@Req() req, @Param('id') id: string) {
    return this.managersService.deleteManager(req.user, id);
  }

  @Delete(':id/permanent')
  async permadelete(@Req() req, @Param('id') id: string) {
    return this.managersService.permadelete(req.user, id);
  }
  @Patch(':id/restore')
  async restoreManager(@Req() req, @Param('id') id: string) {
    return this.managersService.restoreManager(req.user, id);
  }
}
