import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponseService } from 'src/common/api-response.service';

import * as Entity from 'src/entities';
import { AuditService } from 'src/Modules/Audit-log/audit-log.service';

@Injectable()
export class ManagerInventoryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
    private readonly auditService: AuditService,
  ) {}

  async getInventory(_user: any) {
    const managerId = _user.id;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const inventory = await queryRunner.manager
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
        .getRawMany();

      return this.apiResponse.success(
        'Inventory fetched successfully',
        inventory,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch inventory failed';
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

  async getInventoryItem(_user: any, inventoryId: string) {
    const managerId = _user.id;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const inventory = await queryRunner.manager
        .createQueryBuilder(Entity.Inventory, 'inventory')
        .where('inventory.id = :inventoryId', { inventoryId })
        .andWhere('inventory.managerId = :managerId', { managerId })
        .getOne();

      if (!inventory) {
        throw {
          statusCode: 404,
          message: 'Inventory not found',
          errorType: 'Not Found',
        };
      }

      return this.apiResponse.success(
        'Inventory item fetched successfully',
        inventory,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch inventory item failed';
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

  async updateStock(_user: any, inventoryId: string, quantity: number) {
    const managerId = _user.id;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager
        .createQueryBuilder(Entity.Inventory, 'inventory')
        .where('inventory.id = :inventoryId', { inventoryId })
        .andWhere('inventory.managerId = :managerId', { managerId })
        .getOne();

      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Inventory not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.Inventory)
        .set({ quantity })
        .where('id = :inventoryId', { inventoryId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'UPDATE_STOCK',
          entity: 'INVENTORY',
          entityId: inventoryId,
          clientId: existing.clientId,
          oldValue: { quantity: existing.quantity },
          newValue: { quantity },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Stock updated successfully',
        { inventoryId, quantity },
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
