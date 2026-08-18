import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponseService } from 'src/common/api-response.service';
import * as Entity from 'src/entities';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from 'src/Modules/Audit-log/audit-log.service';
import { UpdateProductVariantDto } from '../Dto/update-product-variant.dto';
import { CreateProductVariantDto } from '../Dto/create-product-variant.dto';

@Injectable()
export class ManagerProductVariantsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
    private readonly auditService: AuditService,
  ) {}

  async createVariant(_user: any, dto: CreateProductVariantDto) {
    const managerId = _user.id;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const variant = queryRunner.manager.create(Entity.ProductVariant, {
        id: uuidv4(),
        productId: dto.productId,
        size: dto.size,
        color: dto.color,
        stock: dto.stock,
        price: dto.price,
        createdBy: managerId,
        isActive: true,
      });

      await queryRunner.manager.save(Entity.ProductVariant, variant);
      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'CREATE',
          entity: 'VARIANT',
          entityId: variant.id,
          clientId: _user.clientId,
          newValue: {
            productId: variant.productId,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            price: variant.price,
          },
        },
      );
      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Variant created successfully',
        variant,
        201,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Create variant failed';
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

  async getVariants(_user: any, productId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const variants = await queryRunner.manager
        .createQueryBuilder(Entity.ProductVariant, 'variant')
        .where('variant.productId = :productId', { productId })
        .andWhere('variant.isActive = true')
        .getMany();

      return this.apiResponse.success(
        'Variants fetched successfully',
        variants,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch variants failed';
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

  async updateVariant(
    _user: any,
    variantId: string,
    dto: UpdateProductVariantDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(
        Entity.ProductVariant,
        {
          where: { id: variantId },
        },
      );

      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Variant not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.ProductVariant)
        .set({
          size: dto.size,
          color: dto.color,
          stock: dto.stock,
          price: dto.price,
        })
        .where('id = :variantId', { variantId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'UPDATE',
          entity: 'VARIANT',
          entityId: variantId,
          clientId: _user.clientId,
          oldValue: {
            size: existing.size,
            color: existing.color,
            stock: existing.stock,
            price: existing.price,
          },
          newValue: {
            size: dto.size,
            color: dto.color,
            stock: dto.stock,
            price: dto.price,
          },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Variant updated successfully',
        { variantId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Update variant failed';
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

  async deleteVariant(_user: any, variantId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(
        Entity.ProductVariant,
        {
          where: { id: variantId },
        },
      );

      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Variant not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.ProductVariant)
        .set({ isActive: false })
        .where('id = :variantId', { variantId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'DELETE',
          entity: 'VARIANT',
          entityId: variantId,
          clientId: _user.clientId,
          oldValue: { isActive: existing.isActive },
          newValue: { isActive: false },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Variant deleted successfully',
        { variantId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Delete variant failed';
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

  async restoreVariant(_user: any, variantId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(
        Entity.ProductVariant,
        {
          where: { id: variantId },
        },
      );

      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Variant not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.ProductVariant)
        .set({ isActive: true })
        .where('id = :variantId', { variantId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'RESTORE',
          entity: 'VARIANT',
          entityId: variantId,
          clientId: _user.clientId,
          oldValue: { isActive: existing.isActive },
          newValue: { isActive: true },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Variant restored successfully',
        { variantId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Restore variant failed';
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

  async updateStock(_user: any, variantId: string, stock: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(
        Entity.ProductVariant,
        {
          where: { id: variantId },
        },
      );

      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Variant not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.ProductVariant)
        .set({ stock })
        .where('id = :variantId', { variantId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'UPDATE_STOCK',
          entity: 'VARIANT',
          entityId: variantId,
          clientId: _user.clientId,
          oldValue: { stock: existing.stock },
          newValue: { stock },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Stock updated successfully',
        { variantId, stock },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Update stock failed';
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
}
