import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponseService } from 'src/common/api-response.service';

@Injectable()
export class ManagerReportsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}

  async getProductReport(_user: any, offset: number, limit: number) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const query = queryRunner.manager
        .createQueryBuilder()
        .select([
          'product.id AS productId',
          'product.name AS productName',
          'product.price AS price',
          'product.created_at AS createdAt',
          'COUNT(variant.id) AS variantCount',
        ])
        .from('products', 'product')
        .leftJoin(
          'product_variants',
          'variant',
          'variant.product_id = product.id',
        )
        .where('product.client_id = :clientId', { clientId })
        .groupBy('product.id')
        .orderBy('product.created_at', 'DESC');

      const total = (await query.getRawMany()).length;
      const items = await query.offset(offset).limit(limit).getRawMany();

      return this.apiResponse.success(
        'Product report fetched successfully',
        {
          items,
          pagination: { total, offset, limit },
        },
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch product report failed';
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

  async getInventoryReport(_user: any, offset: number, limit: number) {
    const managerId = _user.id;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const baseQuery = queryRunner.manager
        .createQueryBuilder()
        .select([
          'inventory.id AS inventoryId',
          'product.name AS productName',
          'inventory.quantity AS quantity',
          'inventory.updated_at AS updatedAt',
        ])
        .from('inventory', 'inventory')
        .leftJoin('products', 'product', 'product.id = inventory.product_id')
        .where('inventory.manager_id = :managerId', { managerId })
        .orderBy('inventory.updated_at', 'DESC');

      const total = (await baseQuery.getRawMany()).length;

      const items = await baseQuery.offset(offset).limit(limit).getRawMany();

      return this.apiResponse.success(
        'Inventory report fetched successfully',
        {
          items,
          pagination: { total, offset, limit },
        },
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch inventory report failed';
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

  async getSalesReport(_user: any, offset: number, limit: number) {
    const managerId = _user.id;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const baseQuery = queryRunner.manager
        .createQueryBuilder()
        .select([
          'orders.id AS orderId',
          'product.name AS productName',
          'variant.size AS size',
          'variant.color AS color',
          'item.quantity AS quantity',
          'item.price AS price',
          '(item.quantity * item.price) AS totalAmount',
          'orders.created_at AS orderDate',
        ])
        .from('orders', 'orders')
        .leftJoin('order_items', 'item', 'item.order_id = orders.id')
        .leftJoin('products', 'product', 'product.id = item.product_id')
        .leftJoin('product_variants', 'variant', 'variant.id = item.variant_id')
        .where('orders.manager_id = :managerId', { managerId })
        .orderBy('orders.created_at', 'DESC');

      const total = (await baseQuery.getRawMany()).length;
      const items = await baseQuery.offset(offset).limit(limit).getRawMany();

      return this.apiResponse.success(
        'Sales report fetched successfully',
        {
          items,
          pagination: { total, offset, limit },
        },
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch sales report failed';
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

  async getRevenueReport(_user: any, offset: number, limit: number) {
    const managerId = _user.id;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const baseQuery = queryRunner.manager
        .createQueryBuilder()
        .select([
          'payment.id AS paymentId',
          'payment.amount AS amount',
          'payment.method AS method',
          'payment.status AS status',
          'payment.transaction_id AS transactionId',
          'orders.id AS orderId',
          'payment.created_at AS createdAt',
        ])
        .from('payments', 'payment')
        .leftJoin('orders', 'orders', 'orders.id = payment.order_id')
        .where('orders.manager_id = :managerId', { managerId })
        .orderBy('payment.created_at', 'DESC');

      const total = (await baseQuery.getRawMany()).length;

      const items = await baseQuery.offset(offset).limit(limit).getRawMany();

      return this.apiResponse.success(
        'Revenue report fetched successfully',
        {
          items,
          pagination: { total, offset, limit },
        },
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch revenue report failed';
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
