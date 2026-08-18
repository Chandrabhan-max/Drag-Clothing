import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateClientDto } from './Dto/create-client.dto';
import { JwtGuard } from '../Auth/guards/jwt.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { UpdateClientDto } from './Dto/update-client.dto';
import { CreateUserDto } from './Dto/create-user.dto';
import { UpdateUserDto } from './Dto/update-user.dto';
@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('clients')
  async createClient(@Req() req: any, @Body() body: CreateClientDto) {
    return await this.adminService.createClient(req.user, body);
  }

  @Get('clients')
  async getAllClients(@Req() req: any) {
    return await this.adminService.getAllClients(req.user);
  }

  @Get('clients/:id')
  async getClientById(@Req() req: any, @Param('id') clientId: string) {
    return await this.adminService.getClientsbyid(req.user, clientId);
  }

  @Put('clients/:id')
  async updateClient(
    @Req() req: any,
    @Param('id') clientId: string,
    @Body() body: UpdateClientDto,
  ) {
    return await this.adminService.updateClient(req.user, clientId, body);
  }

  @Delete('clients/:id')
  async deleteClient(@Req() req: any, @Param('id') clientId: string) {
    return await this.adminService.deleteClient(req.user, clientId);
  }

  @Delete(':clientId/permanent')
  async hardDeleteClient(@Req() req, @Param('clientId') clientId: string) {
    return this.adminService.hardDeleteClient(req.user, clientId);
  }

  @Put('clients/:id/restore')
  async restoreClient(@Req() req: any, @Param('id') clientId: string) {
    return await this.adminService.restoreClient(req.user, clientId);
  }

  @Post('users')
  async createUser(@Req() req: any, @Body() body: CreateUserDto) {
    return this.adminService.createUser(req.user, body);
  }

  @Get('users')
  async getAllUsers(@Req() req: any) {
    return this.adminService.getAllUsersHierarchical(req.user);
  }

  @Get('users/:id')
  async getUserById(@Req() req: any, @Param('id') userId: string) {
    return this.adminService.getUserById(req.user, userId);
  }

  @Put('users/:id')
  async updateUser(
    @Req() req: any,
    @Param('id') userId: string,
    @Body() body: UpdateUserDto,
  ) {
    return await this.adminService.updateUser(req.user, userId, body);
  }

  @Delete('users/:id')
  async deleteUser(@Req() req: any, @Param('id') userId: string) {
    return await this.adminService.deleteUser(req.user, userId);
  }

  @Put('users/:id/restore') async restoreUser(
    @Req() req: any,
    @Param('id') userId: string,
  ) {
    return await this.adminService.restoreUser(req.user, userId);
  }

  @Get('customers')
  async getAllCustomers(@Req() req: any) {
    return await this.adminService.getAllCustomers(req.user);
  }

  @Put('customers/:id')
  async updateCustomer(
    @Req() req: any,
    @Param('id') customerId: string,
    @Body() body: any,
  ) {
    return await this.adminService.updateCustomer(req.user, customerId, body);
  }

  @Delete('customers/:id')
  async deleteCustomer(@Req() req: any, @Param('id') customerId: string) {
    return await this.adminService.deleteCustomer(req.user, customerId);
  }

  @Delete('customers/:id/permanent')
  async hardDeleteCustomer(@Req() req: any, @Param('id') customerId: string) {
    return await this.adminService.hardDeleteCustomer(req.user, customerId);
  }

  @Put('customers/:id/restore')
  async restoreCustomer(@Req() req: any, @Param('id') customerId: string) {
    return await this.adminService.restoreCustomer(req.user, customerId);
  }

  @Delete('users/:id/permanent')
  async hardDeleteUser(@Req() req: any, @Param('id') userId: string) {
    return await this.adminService.hardDeleteUser(req.user, userId);
  }
}
