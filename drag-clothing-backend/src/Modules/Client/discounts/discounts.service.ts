import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { ApiResponseService } from 'src/common/api-response.service';

import * as Entity from 'src/entities';

import { CreateDiscountDto } from '../Dto/create-discount.dto';

import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DiscountService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}

  async createDiscount(_user: any, dto: CreateDiscountDto) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { productId, percentage, startDate, endDate } = dto;
      if (!productId || !percentage || !startDate || !endDate) {
        throw {
          statusCode: 422,
          message: 'All fields are required',
          errorType: 'Validation Error',
        };
      }

      const discount = queryRunner.manager.create(Entity.Discount, {
        id: uuidv4(),
        clientId,
        productId,
        percentage,
        startDate,
        endDate,
        isActive: true,
      });

      await queryRunner.manager.save(Entity.Discount, discount);

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Discount created successfully',
        {
          discountId: discount.id,
          productId,
          percentage,
          startDate,
          endDate,
        },
        201,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      let statusCode = 422;
      let message = 'Create discount failed';
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

  async getClientDiscounts(_user: any) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const discounts = await queryRunner.manager
        .createQueryBuilder()
        .select([
          'discount.id AS discountId',
          'discount.product_id AS productId',
          'product.name AS productName',
          'discount.percentage AS percentage',
          'discount.start_date AS startDate',
          'discount.end_date AS endDate',
          'discount.is_active AS isActive',
          'discount.created_at AS createdAt',
        ])
        .from('discounts', 'discount')
        .leftJoin('products', 'product', 'product.id = discount.product_id')
        .where('discount.client_id = :clientId', { clientId })
        .orderBy('discount.created_at', 'DESC')
        .getRawMany();

      return this.apiResponse.success(
        'Discounts fetched successfully',
        discounts,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch discounts failed';
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

  async updateDiscount(_user: any, discountId: string, dto: any) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingDiscount = await queryRunner.manager
        .createQueryBuilder(Entity.Discount, 'discount')
        .where('discount.id = :discountId', { discountId })
        .andWhere('discount.clientId = :clientId', { clientId })
        .andWhere('discount.isActive = true')
        .getOne();

      if (!existingDiscount) {
        throw {
          statusCode: 404,
          message: 'Discount not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.Discount)
        .set({
          percentage: dto.percentage,
          startDate: dto.startDate,
          endDate: dto.endDate,
        })
        .where('id = :discountId', { discountId })
        .execute();

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Discount updated successfully',
        { discountId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      let statusCode = 422;
      let message = 'Update discount failed';
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

  async deleteDiscount(_user: any, discountId: string) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingDiscount = await queryRunner.manager
        .createQueryBuilder(Entity.Discount, 'discount')
        .where('discount.id = :discountId', { discountId })
        .andWhere('discount.clientId = :clientId', { clientId })
        .andWhere('discount.isActive = true')
        .getOne();

      if (!existingDiscount) {
        throw {
          statusCode: 404,
          message: 'Discount not found',
          errorType: 'Not Found',
        };
      }

      if (!existingDiscount.isActive) {
        throw {
          statusCode: 422,
          message: 'Discount already deleted',
          errorType: 'Already Deleted',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.Discount)
        .set({ isActive: false })
        .where('id = :discountId', { discountId })
        .execute();

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Discount deleted successfully',
        { discountId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      let statusCode = 422;
      let message = 'Delete discount failed';
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

  async restoreDiscount(_user: any, discountId: string) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingDiscount = await queryRunner.manager
        .createQueryBuilder(Entity.Discount, 'discount')
        .where('discount.id = :discountId', { discountId })
        .andWhere('discount.clientId = :clientId', { clientId })
        .getOne();

      if (!existingDiscount) {
        throw {
          statusCode: 404,
          message: 'Discount not found',
          errorType: 'Not Found',
        };
      }

      if (existingDiscount.isActive) {
        throw {
          statusCode: 422,
          message: 'Discount is already active',
          errorType: 'Already Active',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.Discount)
        .set({ isActive: true })
        .where('id = :discountId', { discountId })
        .execute();

      await queryRunner.commitTransaction();
      return this.apiResponse.success(
        'Discount restored successfully',
        { discountId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      let statusCode = 422;
      let message = 'Restore discount failed';
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

  async permaDelDiscount(_user: any, discountId: string) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingDiscount = await queryRunner.manager
        .createQueryBuilder(Entity.Discount, 'discount')
        .where('discount.id = :discountId', { discountId })
        .andWhere('discount.clientId = :clientId', { clientId })
        .getOne();

      if (!existingDiscount) {
        throw {
          statusCode: 404,
          message: 'Discount not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Entity.Discount)
        .where('id = :discountId', { discountId })
        .execute();

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Discount permanently deleted successfully',
        { discountId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      let statusCode = 422;
      let message = 'Permanent delete discount failed';
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
