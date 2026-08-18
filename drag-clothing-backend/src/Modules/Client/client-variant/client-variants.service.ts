import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponseService } from 'src/common/api-response.service';
import * as Entity from 'src/entities';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from 'src/Modules/Audit-log/audit-log.service';
import { CreateVariantDto } from '../Dto/create-variant.dto';
import { UpdateVariantDto } from '../Dto/update-variant.dto';

@Injectable()
export class ClientVariantsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
    private readonly auditService: AuditService,
  ) {}

  async createVariant(_user: any, dto: CreateVariantDto) {
    const clientId = _user.clientId;
    const createdBy = _user.id;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager
        .createQueryBuilder(Entity.Product, 'product')
        .where('product.id = :productId', { productId: dto.productId })
        .andWhere('product.clientId = :clientId', { clientId })
        .getOne();

      if (!product) {
        throw {
          statusCode: 404,
          message: 'Product not found or unauthorized',
          errorType: 'Not Found',
        };
      }

      const variant = queryRunner.manager.create(Entity.ProductVariant, {
        id: uuidv4(),
        productId: dto.productId,
        size: dto.size,
        color: dto.color,
        price: dto.price,
        stock: dto.stock,
        createdBy,
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
          clientId,
          newValue: {
            size: variant.size,
            color: variant.color,
            price: variant.price,
            stock: variant.stock,
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
      const statusCode = error?.statusCode || 422;
      const message = error?.message || 'Create variant failed';
      throw new HttpException(
        this.apiResponse.error(message, statusCode, 'Error'),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getVariantsByProduct(_user: any, productId: string) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const product = await queryRunner.manager
        .createQueryBuilder(Entity.Product, 'product')
        .where('product.id = :productId', { productId })
        .andWhere('product.clientId = :clientId', { clientId })
        .getOne();

      if (!product) {
        throw {
          statusCode: 404,
          message: 'Product not found',
          errorType: 'Not Found',
        };
      }

      const variants = await queryRunner.manager
        .createQueryBuilder(Entity.ProductVariant, 'variant')
        .where('variant.productId = :productId', { productId })
        .orderBy('variant.createdAt', 'DESC')
        .getMany();

      return this.apiResponse.success(
        'Variants fetched successfully',
        variants,
        200,
      );
    } catch (error: any) {
      const statusCode = error?.statusCode || 422;
      const message = error?.message || 'Fetch variants failed';
      throw new HttpException(
        this.apiResponse.error(message, statusCode, 'Error'),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateVariant(_user: any, variantId: string, dto: UpdateVariantDto) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager
        .createQueryBuilder(Entity.ProductVariant, 'variant')
        .leftJoinAndSelect(
          Entity.Product,
          'product',
          'product.id = variant.productId',
        )
        .where('variant.id = :variantId', { variantId })
        .andWhere('product.clientId = :clientId', { clientId })
        .getOne();

      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Variant not found or unauthorized',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.ProductVariant)
        .set({
          size: dto.size ?? existing.size,
          color: dto.color ?? existing.color,
          price: dto.price ?? existing.price,
          stock: dto.stock ?? existing.stock,
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
          clientId,
          oldValue: {
            size: existing.size,
            color: existing.color,
            price: existing.price,
            stock: existing.stock,
          },
          newValue: dto,
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
      const statusCode = error?.statusCode || 422;
      const message = error?.message || 'Update variant failed';
      throw new HttpException(
        this.apiResponse.error(message, statusCode, 'Error'),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteVariant(_user: any, variantId: string) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager
        .createQueryBuilder(Entity.ProductVariant, 'variant')
        .leftJoinAndSelect(Entity.Product,'product','product.id = variant.productId',)
        .where('variant.id = :variantId', { variantId })
        .andWhere('product.clientId = :clientId', { clientId })
        .getOne();

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
          action: 'SOFT_DELETE',
          entity: 'VARIANT',
          entityId: variantId,
          clientId,
          oldValue: { isActive: existing.isActive },
          newValue: { isActive: false },
        },
      );

      await queryRunner.commitTransaction();
      return this.apiResponse.success(
        'Variant moved to bin',
        { variantId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      const statusCode = error?.statusCode || 422;
      const message = error?.message || 'Delete variant failed';
      throw new HttpException(
        this.apiResponse.error(message, statusCode, 'Error'),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async restoreVariant(_user: any, variantId: string) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager
        .createQueryBuilder(Entity.ProductVariant, 'variant')
        .leftJoinAndSelect(
          Entity.Product,
          'product',
          'product.id = variant.productId',
        )
        .where('variant.id = :variantId', { variantId })
        .andWhere('product.clientId = :clientId', { clientId })
        .getOne();

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
          clientId,
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
      const statusCode = error?.statusCode || 422;
      const message = error?.message || 'Restore variant failed';
      throw new HttpException(
        this.apiResponse.error(message, statusCode, 'Error'),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // --- NEW: HARD DELETE SERVICE ---
  async hardDeleteVariant(_user: any, variantId: string) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Ensure it exists and belongs to the client's product
      const existing = await queryRunner.manager
        .createQueryBuilder(Entity.ProductVariant, 'variant')
        .leftJoinAndSelect(
          Entity.Product,
          'product',
          'product.id = variant.productId',
        )
        .where('variant.id = :variantId', { variantId })
        .andWhere('product.clientId = :clientId', { clientId })
        .getOne();

      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Variant not found or unauthorized',
          errorType: 'Not Found',
        };
      }

      // Step 2: Physically delete from DB
      await queryRunner.manager.delete(Entity.ProductVariant, {
        id: variantId,
      });

      // Step 3: Log the hard delete
      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'HARD_DELETE',
          entity: 'VARIANT',
          entityId: variantId,
          clientId,
          oldValue: {
            size: existing.size,
            color: existing.color,
            price: existing.price,
            stock: existing.stock,
          },
          newValue: null,
        },
      );

      await queryRunner.commitTransaction();
      return this.apiResponse.success(
        'Variant permanently deleted',
        { variantId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      const statusCode = error?.statusCode || 422;
      const message =
        error?.message ||
        'Permanent delete failed. May be linked to other records.';
      throw new HttpException(
        this.apiResponse.error(message, statusCode, 'Error'),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
