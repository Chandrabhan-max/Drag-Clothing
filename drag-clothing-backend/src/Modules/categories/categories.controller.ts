import { Controller, Post, Get, Put, Delete, Body, Req, Param, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtGuard } from '../Auth/guards/jwt.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseGuards(JwtGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, )
  async createCategory(@Req() req, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(req.user, dto);
  }

  @Get()
  async getCategories(@Req() req) {
    return this.categoriesService.getCategories(req.user);
  }

  @Get('products/:gender/:categoryId')
  async getProductsByGenderAndCategory(@Req() req,@Param('gender') gender: string,@Param('categoryId') categoryId: string,) {
    return this.categoriesService.getProductsByGenderAndCategory(req.user, gender, categoryId);
  }

  @Get(':id')
  async getCategoryById(@Req() req, @Param('id') id: string) {
    return this.categoriesService.getCategoryById(req.user, id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN,)
  async updateCategory(@Req() req, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(req.user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN,)
  async deleteCategory(@Req() req, @Param('id') id: string) {
    return this.categoriesService.deleteCategory(req.user, id);
  }
}
