import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponseService } from 'src/common/api-response.service';
import * as Entity from 'src/entities';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from '../Audit-log/audit-log.service';
import { ProductType } from 'src/common/enums/product-type.enum';
import { Gender } from 'src/common/enums/gender.enum';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
    private readonly auditService: AuditService,
  ) {}

  async createCategory(_user: any, dto: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const category = queryRunner.manager.create(Entity.Category, {
        id: uuidv4(),
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
      });

      await queryRunner.manager.save(Entity.Category, category);
      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'CREATE',
          entity: 'CATEGORY',
          entityId: category.id,
          newValue: {
            name: category.name,
            description: category.description,
            imageUrl: category.imageUrl,
          },
        },
      );
      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Category created successfully',
        category,
        201,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      let statusCode = 422;
      let message = 'Create category failed';
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

  async getCategories(_user: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const categories = await queryRunner.manager
        .createQueryBuilder(Entity.Category, 'category')
        .orderBy('category.createdAt', 'DESC')
        .getMany();
      return this.apiResponse.success(
        'Categories fetched successfully',
        categories,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch categories failed';
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

  async getCategoryById(_user: any, id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const category = await queryRunner.manager
        .createQueryBuilder(Entity.Category, 'category')
        .where('category.id = :id', { id })
        .getOne();

      if (!category)
        throw {
          statusCode: 404,
          message: 'Category not found',
          errorType: 'Not Found',
        };
      return this.apiResponse.success(
        'Category fetched successfully',
        category,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch category failed';
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

  async updateCategory(_user: any, id: string, dto: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(Entity.Category, {
        where: { id },
      });
      if (!existing)
        throw {
          statusCode: 404,
          message: 'Category not found',
          errorType: 'Not Found',
        };

      await queryRunner.manager.update(
        Entity.Category,
        { id },
        {
          name: dto.name,
          description: dto.description,
          imageUrl: dto.imageUrl,
        },
      );

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'UPDATE',
          entity: 'CATEGORY',
          entityId: id,
          oldValue: {
            name: existing.name,
            description: existing.description,
            imageUrl: existing.imageUrl,
          },
          newValue: {
            name: dto.name,
            description: dto.description,
            imageUrl: dto.imageUrl,
          },
        },
      );

      await queryRunner.commitTransaction();
      return this.apiResponse.success(
        'Category updated successfully',
        { id },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      let statusCode = 422;
      let message = 'Update category failed';
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

  async deleteCategory(_user: any, id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(Entity.Category, {
        where: { id },
      });
      if (!existing)
        throw {
          statusCode: 404,
          message: 'Category not found',
          errorType: 'Not Found',
        };

      await queryRunner.manager.delete(Entity.Category, { id });
      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'DELETE',
          entity: 'CATEGORY',
          entityId: id,
          oldValue: {
            name: existing.name,
            description: existing.description,
            imageUrl: existing.imageUrl,
          },
        },
      );
      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Category deleted successfully',
        { id },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      let statusCode = 422;
      let message = 'Delete category failed';
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

  async getProductsByGenderAndCategory(
    _user: any,
    gender: string,
    categoryId: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const normalizedGender = this.normalizeGender(gender);
      const products = await queryRunner.manager
        .createQueryBuilder(Entity.Product, 'product')
        .where('product.gender = :gender', { gender: normalizedGender })
        .andWhere('product.categoryId = :categoryId', { categoryId })
        .andWhere('product.isActive = :isActive', { isActive: true })
        .orderBy('product.createdAt', 'DESC')
        .getMany();
      return this.apiResponse.success(
        'Products fetched successfully',
        {
          gender: normalizedGender,
          categoryId,
          count: products.length,
          data: products,
        },
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

  async getProductsByType(type: string) {
    const normalizedType = this.normalizeProductType(type);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const products = await queryRunner.manager
        .createQueryBuilder(Entity.Product, 'product')
        .where('product.type = :type', { type: normalizedType })
        .andWhere('product.isActive = :isActive', { isActive: true })
        .orderBy('product.createdAt', 'DESC')
        .getMany();

      return this.apiResponse.success(
        'Products fetched successfully',
        {
          count: products.length,
          data: products,
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

  async getProducts(
    gender?: string,
    category?: string,
    subcategory?: string,
    type?: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const qb = queryRunner.manager.createQueryBuilder(
        Entity.Product,
        'product',
      );

      if (gender) {
        const normalizedGender = this.normalizeGender(gender);
        qb.andWhere('product.gender = :gender', {
          gender: normalizedGender,
        });
      }

      if (category) {
        qb.andWhere('product.category = :category', {
          category: category.toUpperCase(),
        });
      }

      if (subcategory) {
        qb.andWhere('product.subcategory = :subcategory', {
          subcategory: subcategory.toUpperCase(),
        });
      }

      if (type) {
        const normalizedType = this.normalizeProductType(type);
        qb.andWhere('product.type = :type', {
          type: normalizedType,
        });
      }

      const products = await qb.getMany();

      return this.apiResponse.success(
        'Products fetched successfully',
        products,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch products failed';
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
}
