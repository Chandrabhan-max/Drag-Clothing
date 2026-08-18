import { HttpException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Product } from 'src/entities';
import { ApiResponseService } from 'src/common/api-response.service';
import { Category, ProductVariant } from 'src/entities';
import { ProductImage } from 'src/entities';
import { ProductType } from 'src/common/enums/product-type.enum';
import { Gender } from 'src/common/enums/gender.enum';

interface FindAllOptions {
  page: number;
  limit: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  gender?: Gender;
  category?: string;
  type?: string;
  color?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}

  async findAll(options: FindAllOptions) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        page,
        limit,
        minPrice,
        maxPrice,
        search,
        gender,
        category,
        type,
        color,
      } = options;
      const qb = queryRunner.manager
        .createQueryBuilder(Product, 'product')
        .leftJoin(Category, 'category', 'category.id = product.categoryId')
        .addSelect('category.name', 'category_name')
        .where('product.isActive = :isActive', { isActive: true })
        .distinct(true);

      if (minPrice !== undefined) {
        qb.andWhere('product.price >= :minPrice', { minPrice });
      }

      if (maxPrice !== undefined) {
        qb.andWhere('product.price <= :maxPrice', { maxPrice });
      }

      if (search) {
        qb.andWhere('product.name LIKE :search', { search: `%${search}%` });
      }

      if (gender) {
        const normalizedGender = this.normalizeGender(gender);
        qb.andWhere('product.gender = :gender', {
          gender: normalizedGender,
        });
      }

      if (category) {
        const normalizedCategory = category
          .replace(/-/g, ' ')
          .trim()
          .toLowerCase();
        qb.andWhere('LOWER(category.name) = :category', {
          category: normalizedCategory,
        });
      }

      if (type) {
        const normalizedType = this.normalizeProductType(type);
        qb.andWhere('product.type = :type', { type: normalizedType });
      }

      if (color) {
        const colors = color
          .split(',')
          .map((c) => c.trim().toLowerCase())
          .filter(Boolean);
        if (colors.length) {
          qb.innerJoin(
            ProductVariant,
            'variant_filter',
            'variant_filter.productId = product.id AND variant_filter.isActive = :variantActive',
            { variantActive: true },
          );
          qb.andWhere('LOWER(variant_filter.color) IN (:...colors)', {
            colors,
          });
        }
      }

      const total = await qb.getCount();

      const { entities, raw } = await qb
        .orderBy('product.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getRawAndEntities();

      const data = entities.map((product, index) => ({
        ...product,
        category: raw[index]?.category_name ?? null,
      }));
      const enrichedData = await this.attachImagesToProducts(queryRunner, data);

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Products fetched successfully',
        {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          data: enrichedData,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Fetching products failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager
        .createQueryBuilder(Product, 'product')
        .where('product.id = :id', { id })
        .getOne();

      if (!product) {
        throw {
          statusCode: 404,
          message: 'Product not found',
          errorType: 'Not Found',
        };
      }
      const [enrichedProduct] = await this.attachImagesToProducts(queryRunner, [
        product,
      ]);

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Product fetched successfully',
        enrichedProduct,
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Fetching product failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async searchProducts(query: any) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { q, minPrice, maxPrice, sort, page = '1', limit = '10' } = query;
      const qb = queryRunner.manager.createQueryBuilder(Product, 'product');

      if (q) {
        qb.andWhere('product.name LIKE :q', { q: `%${q}%` });
      }

      if (minPrice) {
        qb.andWhere('product.price >= :minPrice', { minPrice });
      }

      if (maxPrice) {
        qb.andWhere('product.price <= :maxPrice', { maxPrice });
      }

      if (sort === 'price_asc') {
        qb.orderBy('product.price', 'ASC');
      } else if (sort === 'price_desc') {
        qb.orderBy('product.price', 'DESC');
      } else {
        qb.orderBy('product.createdAt', 'DESC');
      }

      const take = parseInt(limit, 10);
      const skip = (parseInt(page, 10) - 1) * take;

      qb.take(take).skip(skip);

      const [data, total] = await qb.getManyAndCount();
      const enrichedData = await this.attachImagesToProducts(queryRunner, data);

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Products fetched successfully',
        {
          total,
          page: Number(page),
          limit: take,
          totalPages: Math.ceil(total / take),
          data: enrichedData,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Searching products failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getFilters() {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const priceData = await queryRunner.manager
        .createQueryBuilder(Product, 'product')
        .select('MIN(product.price)', 'minPrice')
        .addSelect('MAX(product.price)', 'maxPrice')
        .getRawOne();

      const categories = await queryRunner.manager
        .createQueryBuilder(Category, 'category')
        .select(['category.id', 'category.name'])
        .getMany();

      const colorRows = await queryRunner.manager
        .createQueryBuilder(ProductVariant, 'variant')
        .select('DISTINCT LOWER(variant.color)', 'color')
        .where('variant.isActive = :isActive', { isActive: true })
        .andWhere('variant.color IS NOT NULL')
        .andWhere("TRIM(variant.color) != ''")
        .getRawMany<{ color: string }>();

      const colors = colorRows.map((row) => row.color).filter(Boolean);

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Product filters fetched successfully',
        {
          minPrice: Number(priceData?.minPrice) || 0,
          maxPrice: Number(priceData?.maxPrice) || 0,
          categories,
          colors,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      throw new HttpException(
        this.apiResponse.error(
          'Fetching product filters failed',
          422,
          'Unprocessable Request',
        ),
        422,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getVariants(productId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const variants = await queryRunner.manager
        .createQueryBuilder(ProductVariant, 'variant')
        .where('variant.productId = :productId', { productId })
        .getMany();

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Variants fetched successfully',
        variants,
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      throw new HttpException(
        this.apiResponse.error(
          'Fetch variants failed',
          422,
          'Unprocessable Request',
        ),
        422,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getRelatedProducts(productId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager
        .createQueryBuilder(Product, 'product')
        .where('product.id = :productId', { productId })
        .getOne();

      if (!product) {
        throw {
          statusCode: 404,
          message: 'Product not found',
          errorType: 'Not Found',
        };
      }

      const related = await queryRunner.manager
        .createQueryBuilder(Product, 'product')
        .where('product.categoryId = :categoryId', {
          categoryId: product.categoryId,
        })
        .andWhere('product.id != :productId', { productId })
        .limit(8)
        .getMany();
      const enrichedRelated = await this.attachImagesToProducts(
        queryRunner,
        related,
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Related products fetched successfully',
        enrichedRelated,
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Fetch related products failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      }

      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getProductsByCategory(categoryName: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const products = await queryRunner.manager
        .createQueryBuilder(Product, 'product')
        .innerJoin(Category, 'category', 'category.id = product.categoryId')
        .where('category.name = :categoryName', { categoryName })
        .andWhere('product.isActive = :isProductActive', {
          isProductActive: true,
        })
        .getMany();
      const enrichedProducts = await this.attachImagesToProducts(
        queryRunner,
        products,
      );

      return this.apiResponse.success(
        'Products fetched successfully',
        enrichedProducts,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch category products failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getProductsByType(type: ProductType) {
    if (!Object.values(ProductType).includes(type)) {
      throw {
        statusCode: 400,
        message: 'Invalid product type',
        errorType: 'Bad Request',
      };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const products = await queryRunner.manager
        .createQueryBuilder(Product, 'product')
        .where('product.type = :type', { type })
        .andWhere('product.isActive = :isActive', { isActive: true })
        .orderBy('product.createdAt', 'DESC')
        .getMany();
      const enrichedProducts = await this.attachImagesToProducts(
        queryRunner,
        products,
      );

      return this.apiResponse.success(
        'Products fetched successfully',
        {
          count: enrichedProducts.length,
          data: enrichedProducts,
        },
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch products by type failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getProductsByGenderCategory(gender: string, category: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const normalizedGender = this.normalizeGender(gender);
      const normalizedCategory = decodeURIComponent(category)
        .replace(/-/g, ' ')
        .trim()
        .toLowerCase();

      const products = await queryRunner.manager
        .createQueryBuilder(Product, 'product')
        .innerJoin(Category, 'category', 'category.id = product.categoryId')
        .where('product.gender = :gender', { gender: normalizedGender })
        .andWhere('LOWER(category.name) = :category', {
          category: normalizedCategory,
        })
        .andWhere('product.isActive = :isActive', { isActive: true })
        .orderBy('product.createdAt', 'DESC')
        .getMany();
      const enrichedProducts = await this.attachImagesToProducts(
        queryRunner,
        products,
      );

      return this.apiResponse.success(
        'Products fetched successfully',
        enrichedProducts,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch products by gender and category failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getProductsByGenderCategoryType(
    gender: string,
    category: string,
    type: ProductType,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const normalizedGender = this.normalizeGender(gender);
      const normalizedCategory = decodeURIComponent(category)
        .replace(/-/g, ' ')
        .trim()
        .toLowerCase();
      const products = await queryRunner.manager
        .createQueryBuilder(Product, 'product')
        .innerJoin(Category, 'category', 'category.id = product.categoryId')
        .where('product.gender = :gender', { gender: normalizedGender })
        .andWhere('LOWER(category.name) = :category', {
          category: normalizedCategory,
        })
        .andWhere('product.type = :type', { type })
        .andWhere('product.isActive = :isActive', { isActive: true })
        .orderBy('product.createdAt', 'DESC')
        .getMany();
      const enrichedProducts = await this.attachImagesToProducts(
        queryRunner,
        products,
      );

      return this.apiResponse.success(
        'Products fetched successfully',
        enrichedProducts,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch products by gender, category and type failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getProductTypes() {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const types = Object.values(ProductType).map((type) => ({
        label: this.formatLabel(type),
        value: type,
      }));

      return this.apiResponse.success(
        'Product types fetched successfully',
        types,
      );
    } catch (error) {
      return this.apiResponse.error('Failed to fetch product types', error);
    } finally {
      await queryRunner.release();
    }
  }

  private formatLabel(type: string): string {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private normalizeToEnum(value: string): string {
    return value
      .trim()
      .replace(/&/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\s+/g, '_')
      .toUpperCase();
  }

  private normalizeProductType(value: string): ProductType {
    const normalized = this.normalizeToEnum(value);
    if (!Object.values(ProductType).includes(normalized as ProductType)) {
      throw {
        statusCode: 400,
        message: 'Invalid product type',
        errorType: 'Bad Request',
      };
    }
    return normalized as ProductType;
  }

  private normalizeGender(value: string): Gender {
    const normalized = value.trim().toUpperCase();
    if (!Object.values(Gender).includes(normalized as Gender)) {
      throw {
        statusCode: 400,
        message: 'Invalid gender',
        errorType: 'Bad Request',
      };
    }
    return normalized as Gender;
  }

  private async attachImagesToProducts(queryRunner: any, products: any[]) {
    if (!Array.isArray(products) || products.length === 0) {
      return products;
    }

    const productIds = products
      .map((product) => product?.id)
      .filter((id) => typeof id === 'string' && id.length > 0);

    if (!productIds.length) {
      return products;
    }

    // Images
    const imageRows = await queryRunner.manager
      .createQueryBuilder(ProductImage, 'image')
      .where('image.productId IN (:...productIds)', { productIds })
      .orderBy('image.createdAt', 'ASC')
      .getMany();

    const imageMap = new Map<string, string[]>();

    for (const row of imageRows) {
      const existing = imageMap.get(row.productId) ?? [];
      existing.push(row.imageUrl);
      imageMap.set(row.productId, existing);
    }

    // Active Flash Sales
    const discountRows = await queryRunner.manager
      .createQueryBuilder()
      .select('discount.product_id', 'productId')
      .addSelect('MAX(discount.percentage)', 'percentage')
      .from('discounts', 'discount')
      .where('discount.product_id IN (:...productIds)', { productIds })
      .andWhere('discount.is_active = :isActive', { isActive: true })
      .andWhere('discount.start_date <= CURRENT_TIMESTAMP')
      .andWhere('discount.end_date >= CURRENT_TIMESTAMP')
      .groupBy('discount.product_id')
      .getRawMany();

    const discountMap = new Map<string, number>();

    for (const row of discountRows) {
      discountMap.set(row.productId, Number(row.percentage) || 0);
    }

    return products.map((product) => {
      const images = imageMap.get(product.id) ?? [];

      const originalPrice = Number(product.price) || 0;
      const discountPercentage = discountMap.get(product.id) || 0;

      const discountedPrice =
        discountPercentage > 0
          ? Number(
              (
                originalPrice -
                (originalPrice * discountPercentage) / 100
              ).toFixed(2),
            )
          : originalPrice;

      return {
        ...product,

        images,
        imageUrl: images[0] ?? product.imageUrl ?? null,

        // Flash Sale pricing
        originalPrice,
        discountPercentage,
        discountedPrice,
        hasFlashSale: discountPercentage > 0,
      };
    });
  }
}
