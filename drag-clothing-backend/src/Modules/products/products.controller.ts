import { Controller, Get, Param, ParseEnumPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { SearchProductDto } from './dto/search-product.dto';
import { ProductType } from 'src/common/enums/product-type.enum';
import { Gender } from 'src/common/enums/gender.enum';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getProducts(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('minPrice') minPrice: string,
    @Query('maxPrice') maxPrice: string,
    @Query('search') search: string,
    @Query('gender') gender: Gender,
    @Query('category') category: string,
    @Query('type') type: string,
    @Query('color') color: string,
  ) {
    return this.productsService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      search,
      gender,
      category,
      type,
      color,
    });
  }

  @Get('search')
  searchProducts(@Query() query: SearchProductDto) {
    return this.productsService.searchProducts(query);
  }

  @Get('filters')
  getFilters() {
    return this.productsService.getFilters();
  }

  @Get('type/:type')
  getProductsByType(
    @Param('type', new ParseEnumPipe(ProductType)) type: ProductType,
  ) {
    return this.productsService.getProductsByType(type);
  }

  @Get('types')
  async getProductTypes() {
    return this.productsService.getProductTypes();
  }

  @Get('category/:categoryName')
  async getProductsByCategory(@Param('categoryName') categoryName: string) {
    return this.productsService.getProductsByCategory(categoryName);
  }

  @Get(':id/variants')
  getVariants(@Param('id') id: string) {
    return this.productsService.getVariants(id);
  }

  @Get(':id/related')
  getRelated(@Param('id') id: string) {
    return this.productsService.getRelatedProducts(id);
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':gender/:category/:type')
  getProductsByGenderCategoryType(
    @Param('gender') gender: string,
    @Param('category') category: string,
    @Param('type', new ParseEnumPipe(ProductType)) type: ProductType,
  ) {
    return this.productsService.getProductsByGenderCategoryType(
      gender,
      category,
      type,
    );
  }

  @Get(':gender/:category')
  getProductsByGenderCategory(
    @Param('gender') gender: string,
    @Param('category') category: string,
  ) {
    return this.productsService.getProductsByGenderCategory(gender, category);
  }
}
