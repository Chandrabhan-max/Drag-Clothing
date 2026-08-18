import {
  Injectable,
  HttpException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import * as Entity from 'src/entities';

import { ApiResponseService } from 'src/common/api-response.service';

@Injectable()
export class ManagerDashboardService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}

  async getDashboard(user: any) {
    const clientId = user?.clientId;

    if (!clientId) {
      throw new HttpException(
        this.apiResponse.error(
          'Invalid session',
          401,
          'Unauthorized',
        ),
        401,
      );
    }

    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const totalProducts =
        await queryRunner.manager
          .createQueryBuilder(
            Entity.Product,
            'p',
          )
          .where(
            'p.clientId = :clientId',
            { clientId },
          )
          .getCount();

      const totalProductVariants =
        await queryRunner.manager
          .createQueryBuilder(
            Entity.ProductVariant,
            'pv',
          )
          .innerJoin(
            Entity.Product,
            'p',
            'p.id = pv.productId',
          )
          .where(
            'p.clientId = :clientId',
            { clientId },
          )
          .getCount();

      const totalInventory =
        await queryRunner.manager
          .createQueryBuilder(
            Entity.Inventory,
            'i',
          )
          .where(
            'i.clientId = :clientId',
            { clientId },
          )
          .getCount();

      const lowStockItems =
        await queryRunner.manager
          .createQueryBuilder(
            Entity.Inventory,
            'i',
          )
          .where(
            'i.clientId = :clientId',
            { clientId },
          )
          .andWhere(
            'i.quantity <= :qty',
            { qty: 10 },
          )
          .getCount();

      const totalStock =
        await queryRunner.manager
          .createQueryBuilder(
            Entity.Inventory,
            'i',
          )
          .select(
            'COALESCE(SUM(i.quantity), 0)',
            'total',
          )
          .where(
            'i.clientId = :clientId',
            { clientId },
          )
          .getRawOne();

      return this.apiResponse.success(
        'Manager dashboard fetched successfully',
        {
          totalProducts,
          totalProductVariants,
          totalInventory,
          lowStockItems,
          totalStock: Number(
            totalStock?.total || 0,
          ),
        },
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message =
        'Fetch dashboard failed';
      let errorType =
        'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message =
          error.message ?? message;
        errorType =
          error.errorType ??
          errorType;
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