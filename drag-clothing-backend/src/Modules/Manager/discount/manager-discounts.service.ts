import {
  HttpException,
  Injectable,
} from '@nestjs/common';

import { DataSource } from 'typeorm';
import * as Entity from 'src/entities';
import { ApiResponseService } from 'src/common/api-response.service';
import { AuditService } from 'src/Modules/Audit-log/audit-log.service';
import { v4 as uuidv4 } from 'uuid';

import { CreateManagerDiscountDto } from '../Dto/create-manager-discount.dto';
import { UpdateManagerDiscountDto } from '../Dto/update-manager-discount.dto';

@Injectable()
export class ManagerDiscountsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
    private readonly auditService: AuditService,
  ) {}

  private validateDatesAndPercentage(
    percentage: number,
    startDate: string | Date,
    endDate: string | Date,
  ) {
    const numericPercentage = Number(percentage);

    if (
      !Number.isFinite(numericPercentage) ||
      numericPercentage <= 0 ||
      numericPercentage > 100
    ) {
      throw {
        statusCode: 422,
        message: 'Discount percentage must be between 1 and 100',
        errorType: 'Validation Error',
      };
    }

    if (!startDate || !endDate) {
      throw {
        statusCode: 422,
        message: 'Start date and end date are required',
        errorType: 'Validation Error',
      };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      throw {
        statusCode: 422,
        message: 'Invalid start or end date',
        errorType: 'Validation Error',
      };
    }

    if (end < start) {
      throw {
        statusCode: 422,
        message: 'End date cannot be before start date',
        errorType: 'Validation Error',
      };
    }
  }

  private async ensureManagerProduct(
    queryRunner: any,
    clientId: string,
    productId: string,
  ) {
    if (!productId) {
      throw {
        statusCode: 422,
        message: 'productId is required',
        errorType: 'Validation Error',
      };
    }

    const product = await queryRunner.manager
      .createQueryBuilder(
        Entity.Product,
        'product',
      )
      .where(
        'product.id = :productId',
        { productId },
      )
      .andWhere(
        'product.clientId = :clientId',
        { clientId },
      )
      .getOne();

    if (!product) {
      throw {
        statusCode: 404,
        message: 'Product not found for this manager',
        errorType: 'Not Found',
      };
    }

    return product;
  }

  async createDiscount(
    _user: any,
    dto: CreateManagerDiscountDto,
  ) {
    const clientId = _user.clientId;

    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!clientId) {
        throw {
          statusCode: 403,
          message: 'Manager is not assigned to a client',
          errorType: 'Forbidden',
        };
      }

      const {
        productId,
        percentage,
        startDate,
        endDate,
      } = dto;

      if (
        !productId ||
        percentage === undefined ||
        percentage === null ||
        !startDate ||
        !endDate
      ) {
        throw {
          statusCode: 422,
          message: 'All fields are required',
          errorType: 'Validation Error',
        };
      }

      this.validateDatesAndPercentage(
        percentage,
        startDate,
        endDate,
      );

      await this.ensureManagerProduct(
        queryRunner,
        clientId,
        productId,
      );

      const existingActive =
        await queryRunner.manager
          .createQueryBuilder(
            Entity.Discount,
            'discount',
          )
          .where(
            'discount.productId = :productId',
            { productId },
          )
          .andWhere(
            'discount.clientId = :clientId',
            { clientId },
          )
          .andWhere(
            'discount.isActive = :isActive',
            { isActive: true },
          )
          .getOne();

      if (existingActive) {
        throw {
          statusCode: 409,
          message:
            'An active discount already exists for this product',
          errorType: 'Conflict',
        };
      }

      const discount =
        queryRunner.manager.create(
          Entity.Discount,
          {
            id: uuidv4(),
            clientId,
            productId,
            percentage: Number(percentage),
            startDate,
            endDate,
            isActive: true,
          },
        );

      await queryRunner.manager.save(
        Entity.Discount,
        discount,
      );

      await this.auditService
        .createAuditLogWithQueryRunner(
          queryRunner,
          _user,
          {
            action: 'CREATE',
            entity: 'DISCOUNT',
            entityId: discount.id,
            clientId,
            newValue: {
              productId,
              percentage: Number(percentage),
              startDate,
              endDate,
              isActive: true,
            },
          },
        );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Discount created successfully',
        {
          discountId: discount.id,
          productId,
          percentage: Number(percentage),
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
        errorType =
          error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(
          message,
          statusCode,
          errorType,
        ),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getDiscounts(_user: any) {
    const clientId = _user.clientId;

    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      if (!clientId) {
        throw {
          statusCode: 403,
          message: 'Manager is not assigned to a client',
          errorType: 'Forbidden',
        };
      }

      const discounts =
        await queryRunner.manager
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
          .from(
            'discounts',
            'discount',
          )
          .leftJoin(
            'products',
            'product',
            'product.id = discount.product_id',
          )
          .where(
            'discount.client_id = :clientId',
            { clientId },
          )
          .orderBy(
            'discount.created_at',
            'DESC',
          )
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
        errorType =
          error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(
          message,
          statusCode,
          errorType,
        ),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateDiscount(
    _user: any,
    discountId: string,
    dto: UpdateManagerDiscountDto,
  ) {
    const clientId = _user.clientId;

    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!discountId) {
        throw {
          statusCode: 422,
          message: 'discountId is required',
          errorType: 'Validation Error',
        };
      }

      const existingDiscount =
        await queryRunner.manager
          .createQueryBuilder(
            Entity.Discount,
            'discount',
          )
          .where(
            'discount.id = :discountId',
            { discountId },
          )
          .andWhere(
            'discount.clientId = :clientId',
            { clientId },
          )
          .andWhere(
            'discount.isActive = :isActive',
            { isActive: true },
          )
          .getOne();

      if (!existingDiscount) {
        throw {
          statusCode: 404,
          message: 'Discount not found',
          errorType: 'Not Found',
        };
      }

      this.validateDatesAndPercentage(
        dto.percentage,
        dto.startDate,
        dto.endDate,
      );

      const updateData: any = {
        percentage: Number(dto.percentage),
        startDate: dto.startDate,
        endDate: dto.endDate,
      };

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.Discount)
        .set(updateData)
        .where(
          'id = :discountId',
          { discountId },
        )
        .andWhere(
          'clientId = :clientId',
          { clientId },
        )
        .execute();

      await this.auditService
        .createAuditLogWithQueryRunner(
          queryRunner,
          _user,
          {
            action: 'UPDATE',
            entity: 'DISCOUNT',
            entityId: discountId,
            clientId,
            oldValue: {
              percentage:
                existingDiscount.percentage,
              startDate:
                existingDiscount.startDate,
              endDate:
                existingDiscount.endDate,
              isActive:
                existingDiscount.isActive,
            },
            newValue: updateData,
          },
        );

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
        errorType =
          error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(
          message,
          statusCode,
          errorType,
        ),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteDiscount(
    _user: any,
    discountId: string,
  ) {
    const clientId = _user.clientId;

    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingDiscount =
        await queryRunner.manager
          .createQueryBuilder(
            Entity.Discount,
            'discount',
          )
          .where(
            'discount.id = :discountId',
            { discountId },
          )
          .andWhere(
            'discount.clientId = :clientId',
            { clientId },
          )
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
        .set({
          isActive: false,
        })
        .where(
          'id = :discountId',
          { discountId },
        )
        .andWhere(
          'clientId = :clientId',
          { clientId },
        )
        .execute();

      await this.auditService
        .createAuditLogWithQueryRunner(
          queryRunner,
          _user,
          {
            action: 'DELETE',
            entity: 'DISCOUNT',
            entityId: discountId,
            clientId,
            oldValue: {
              isActive:
                existingDiscount.isActive,
            },
            newValue: {
              isActive: false,
            },
          },
        );

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
        errorType =
          error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(
          message,
          statusCode,
          errorType,
        ),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async restoreDiscount(
    _user: any,
    discountId: string,
  ) {
    const clientId = _user.clientId;

    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingDiscount =
        await queryRunner.manager
          .createQueryBuilder(
            Entity.Discount,
            'discount',
          )
          .where(
            'discount.id = :discountId',
            { discountId },
          )
          .andWhere(
            'discount.clientId = :clientId',
            { clientId },
          )
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

      const anotherActive =
        await queryRunner.manager
          .createQueryBuilder(
            Entity.Discount,
            'discount',
          )
          .where(
            'discount.productId = :productId',
            {
              productId:
                existingDiscount.productId,
            },
          )
          .andWhere(
            'discount.clientId = :clientId',
            { clientId },
          )
          .andWhere(
            'discount.isActive = :isActive',
            { isActive: true },
          )
          .getOne();

      if (anotherActive) {
        throw {
          statusCode: 409,
          message:
            'Another active discount already exists for this product',
          errorType: 'Conflict',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.Discount)
        .set({
          isActive: true,
        })
        .where(
          'id = :discountId',
          { discountId },
        )
        .andWhere(
          'clientId = :clientId',
          { clientId },
        )
        .execute();

      await this.auditService
        .createAuditLogWithQueryRunner(
          queryRunner,
          _user,
          {
            action: 'RESTORE',
            entity: 'DISCOUNT',
            entityId: discountId,
            clientId,
            oldValue: {
              isActive:
                existingDiscount.isActive,
            },
            newValue: {
              isActive: true,
            },
          },
        );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Discount restored successfully',
        { discountId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      let statusCode = 422;
      let message = 'Restore discount failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType =
          error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(
          message,
          statusCode,
          errorType,
        ),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async hardDeleteDiscount(
    _user: any,
    discountId: string,
  ) {
    const clientId = _user.clientId;

    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingDiscount =
        await queryRunner.manager
          .createQueryBuilder(
            Entity.Discount,
            'discount',
          )
          .where(
            'discount.id = :discountId',
            { discountId },
          )
          .andWhere(
            'discount.clientId = :clientId',
            { clientId },
          )
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
        .where(
          'id = :discountId',
          { discountId },
        )
        .andWhere(
          'clientId = :clientId',
          { clientId },
        )
        .execute();

      await this.auditService
        .createAuditLogWithQueryRunner(
          queryRunner,
          _user,
          {
            action: 'HARD_DELETE',
            entity: 'DISCOUNT',
            entityId: discountId,
            clientId,
            oldValue: {
              productId:
                existingDiscount.productId,
              percentage:
                existingDiscount.percentage,
              startDate:
                existingDiscount.startDate,
              endDate:
                existingDiscount.endDate,
              isActive:
                existingDiscount.isActive,
            },
            newValue: null,
          },
        );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Discount permanently deleted',
        { discountId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      let statusCode = 422;
      let message =
        'Permanent delete discount failed';
      let errorType =
        'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType =
          error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(
          message,
          statusCode,
          errorType,
        ),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
