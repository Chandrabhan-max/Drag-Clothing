import { Injectable, HttpException } from '@nestjs/common';

import { DataSource } from 'typeorm';

import * as Entity from 'src/entities';

import { ApiResponseService } from 'src/common/api-response.service';

@Injectable()
export class ClientDashboardService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}

  async getDashboard(user: any) {
    const clientId = user?.clientId;

    if (!clientId) {
      throw {
        statusCode: 401,
        message: 'Invalid session',
        errorType: 'Unauthorized',
      };
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      // =====================================================
      // TOTAL PRODUCTS
      // =====================================================

      const totalProducts = await queryRunner.manager
        .createQueryBuilder(Entity.Product, 'p')
        .where('p.clientId = :clientId', { clientId })
        .getCount();

      // =====================================================
      // TOTAL INVENTORY
      // =====================================================

      const totalInventory = await queryRunner.manager
        .createQueryBuilder(Entity.Inventory, 'i')
        .where('i.clientId = :clientId', { clientId })
        .getCount();

      // =====================================================
      // TOTAL ORDERS
      // =====================================================

      const totalOrders = await queryRunner.manager
        .createQueryBuilder(Entity.Order, 'o')
        .where('o.clientId = :clientId', { clientId })
        .getCount();

      // =====================================================
      // TOTAL MANAGERS
      // =====================================================

      const totalManagers = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'u')
        .where('u.clientId = :clientId', { clientId })
        .andWhere('u.role = :role', {
          role: 'manager',
        })
        .getCount();

      // =====================================================
      // LOW STOCK PRODUCTS
      // =====================================================

      const lowStockProducts = await queryRunner.manager
        .createQueryBuilder(Entity.Inventory, 'i')
        .where('i.clientId = :clientId', { clientId })
        .andWhere('i.quantity <= :qty', { qty: 10 })
        .getCount();

      // =====================================================
      // RECENT SALES
      // =====================================================

      /*
       * We intentionally use the actual database tables here
       * so we can fetch the latest product sales directly from
       * orders + order_items + products.
       *
       * Only this client's orders are included.
       */

      const recentProducts = await queryRunner.manager
        .createQueryBuilder()

        .select([
          'p.id AS productId',

          'p.name AS productName',

          'oi.quantity AS quantity',

          'oi.price AS price',

          '(oi.quantity * oi.price) AS total',

          'o.id AS orderId',

          'o.status AS orderStatus',

          'o.created_at AS orderDate',
        ])

        .from('order_items', 'oi')

        .innerJoin('orders', 'o', 'o.id = oi.order_id')

        .innerJoin('products', 'p', 'p.id = oi.product_id')

        .where('o.client_id = :clientId', { clientId })

        .andWhere("o.status <> 'cancelled'")

        .orderBy('o.created_at', 'DESC')
        .addOrderBy('o.id', 'DESC')

        .limit(6)

        .getRawMany();

      // =====================================================
      // FORMAT RECENT PRODUCTS
      // =====================================================

      const formattedRecentProducts = recentProducts.map((item: any) => ({
        productId: item.productId,

        productName: item.productName,

        quantity: Number(item.quantity || 0),

        price: Number(item.price || 0),

        total: Number(item.total || 0),

        orderId: item.orderId,

        orderStatus: item.orderStatus,

        orderDate: item.orderDate,
      }));

      // =====================================================
      // RESPONSE
      // =====================================================

      return this.apiResponse.success(
        'Dashboard fetched successfully',

        {
          totalProducts,

          totalInventory,

          totalOrders,

          totalManagers,

          lowStockProducts,

          recentProducts: formattedRecentProducts,
        },

        200,
      );
    } catch (error: any) {
      console.error('CLIENT DASHBOARD ERROR:', error);

      let statusCode = 422;

      let message = 'Fetch dashboard failed';

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
