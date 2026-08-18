import {
  Injectable,
  HttpException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { ApiResponseService } from 'src/common/api-response.service';

import { Role } from 'src/common/enums/role.enum';


@Injectable()
export class ReportsService {

  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}


  // =========================================================
  // SUMMARY REPORT
  // =========================================================

  async getSummary(_user: any) {

    const clientId = _user?.clientId;

    if (!clientId) {
      throw new HttpException(
        this.apiResponse.error(
          'Client ID not found in authenticated user',
          400,
          'Bad Request',
        ),
        400,
      );
    }


    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();


    try {

      // =====================================================
      // TOTAL ORDERS
      // =====================================================

      const totalOrdersResult =
        await queryRunner.manager
          .createQueryBuilder()
          .select(
            'COUNT(o.id)',
            'count',
          )
          .from('orders', 'o')
          .where(
            'o.client_id = :clientId',
            { clientId },
          )
          .andWhere(
            "o.status <> 'cancelled'",
          )
          .getRawOne();


      // =====================================================
      // TOTAL REVENUE
      // =====================================================

      const totalRevenueResult =
        await queryRunner.manager
          .createQueryBuilder()
          .select(
            'COALESCE(SUM(o.total_amount), 0)',
            'total',
          )
          .from('orders', 'o')
          .where(
            'o.client_id = :clientId',
            { clientId },
          )
          .andWhere(
            "o.status <> 'cancelled'",
          )
          .getRawOne();


      // =====================================================
      // TOTAL PRODUCTS SOLD
      // =====================================================

      const totalProductsSoldResult =
        await queryRunner.manager
          .createQueryBuilder()
          .select(
            'COALESCE(SUM(oi.quantity), 0)',
            'total',
          )
          .from('order_items', 'oi')
          .innerJoin(
            'orders',
            'o',
            'o.id = oi.order_id',
          )
          .where(
            'o.client_id = :clientId',
            { clientId },
          )
          .andWhere(
            "o.status <> 'cancelled'",
          )
          .getRawOne();


      // =====================================================
      // ACTIVE DISCOUNTS
      // =====================================================

      const totalActiveDiscountsResult =
        await queryRunner.manager
          .createQueryBuilder()
          .select(
            'COUNT(d.id)',
            'count',
          )
          .from('discounts', 'd')
          .where(
            'd.client_id = :clientId',
            { clientId },
          )
          .andWhere(
            'd.is_active = :active',
            { active: true },
          )
          .getRawOne();


      const data = {

        totalOrders:
          Number(
            totalOrdersResult?.count || 0,
          ),

        totalRevenue:
          Number(
            totalRevenueResult?.total || 0,
          ),

        totalProductsSold:
          Number(
            totalProductsSoldResult?.total || 0,
          ),

        totalActiveDiscounts:
          Number(
            totalActiveDiscountsResult?.count || 0,
          ),

      };


      return this.apiResponse.success(
        'Summary report fetched successfully',
        data,
        200,
      );


    } catch (error: any) {

      console.error(
        'REPORT SUMMARY ERROR:',
        error,
      );


      let statusCode = 422;

      let message =
        'Summary report failed';

      let errorType =
        'Unprocessable Request';


      if (error?.statusCode) {

        statusCode =
          error.statusCode;

        message =
          error.message ??
          message;

        errorType =
          error.errorType ??
          errorType;

      } else if (error?.message) {

        message =
          error.message;

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


  // =========================================================
  // PRODUCT REPORT
  // =========================================================

  async getProductReport(_user: any) {

    const clientId =
      _user?.clientId;


    if (!clientId) {

      throw new HttpException(
        this.apiResponse.error(
          'Client ID not found in authenticated user',
          400,
          'Bad Request',
        ),
        400,
      );

    }


    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();


    try {

      const products =
        await queryRunner.manager
          .createQueryBuilder()

          .select([
            'p.id AS productId',

            'p.name AS productName',

            'COALESCE(SUM(oi.quantity), 0) AS totalSold',

            'COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue',
          ])

          .from(
            'products',
            'p',
          )

          .leftJoin(
            'order_items',
            'oi',
            'oi.product_id = p.id',
          )

          .leftJoin(
            'orders',
            'o',
            'o.id = oi.order_id',
          )

          .where(
            'p.client_id = :clientId',
            { clientId },
          )

          .andWhere(
            `(o.id IS NULL OR o.status <> 'cancelled')`,
          )

          .groupBy(
            'p.id',
          )

          .addGroupBy(
            'p.name',
          )

          .orderBy(
            'totalSold',
            'DESC',
          )

          .getRawMany();


      const formattedProducts =
        products.map(
          (product: any) => ({

            productId:
              product.productId,

            productName:
              product.productName,

            totalSold:
              Number(
                product.totalSold || 0,
              ),

            revenue:
              Number(
                product.revenue || 0,
              ),

          }),
        );


      return this.apiResponse.success(
        'Product report fetched successfully',
        formattedProducts,
        200,
      );


    } catch (error: any) {

      console.error(
        'PRODUCT REPORT ERROR:',
        error,
      );


      let statusCode = 422;

      let message =
        'Product report failed';

      let errorType =
        'Unprocessable Request';


      if (error?.statusCode) {

        statusCode =
          error.statusCode;

        message =
          error.message ??
          message;

        errorType =
          error.errorType ??
          errorType;

      } else if (error?.message) {

        message =
          error.message;

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


  // =========================================================
  // MANAGER REPORT
  // =========================================================

  async getManagerReport(_user: any) {

    const clientId =
      _user?.clientId;


    if (!clientId) {

      throw new HttpException(
        this.apiResponse.error(
          'Client ID not found in authenticated user',
          400,
          'Bad Request',
        ),
        400,
      );

    }


    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();


    try {

      const managers =
        await queryRunner.manager
          .createQueryBuilder()

          .select([
            'u.id AS managerId',

            'u.name AS managerName',

            'COUNT(o.id) AS totalOrders',

            'COALESCE(SUM(o.total_amount), 0) AS revenue',
          ])

          .from(
            'users',
            'u',
          )

          .leftJoin(
            'orders',
            'o',
            `o.manager_id = u.id
             AND o.client_id = :clientId
             AND o.status <> 'cancelled'`,
            { clientId },
          )

          .where(
            'u.client_id = :clientId',
            { clientId },
          )

          .andWhere(
            'u.role = :managerRole',
            {
              managerRole:
                Role.MANAGER,
            },
          )

          .groupBy(
            'u.id',
          )

          .addGroupBy(
            'u.name',
          )

          .orderBy(
            'revenue',
            'DESC',
          )

          .getRawMany();


      const formattedManagers =
        managers.map(
          (manager: any) => ({

            managerId:
              manager.managerId,

            managerName:
              manager.managerName,

            totalOrders:
              Number(
                manager.totalOrders || 0,
              ),

            revenue:
              Number(
                manager.revenue || 0,
              ),

          }),
        );


      return this.apiResponse.success(
        'Manager report fetched successfully',
        formattedManagers,
        200,
      );


    } catch (error: any) {

      console.error(
        'MANAGER REPORT ERROR:',
        error,
      );


      let statusCode = 422;

      let message =
        'Manager report failed';

      let errorType =
        'Unprocessable Request';


      if (error?.statusCode) {

        statusCode =
          error.statusCode;

        message =
          error.message ??
          message;

        errorType =
          error.errorType ??
          errorType;

      } else if (error?.message) {

        message =
          error.message;

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