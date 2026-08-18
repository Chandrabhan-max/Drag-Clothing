import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponseService } from 'src/common/api-response.service';
import { DistributeInventoryDto } from '../Dto/distribute-inventory.dto';
import * as Entity from 'src/entities';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from 'src/Modules/Audit-log/audit-log.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
    private readonly auditService: AuditService,
  ) {}

  async distributeStock(_user: any, dto: DistributeInventoryDto) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { managerId, productId, quantity } = dto;

      if (!managerId || !productId || !quantity) {
        throw {
          statusCode: 422,
          message: 'managerId, productId and quantity are required',
          errorType: 'Validation Error',
        };
      }

      // Make sure manager belongs to the current client
      const manager = await queryRunner.manager
        .createQueryBuilder()
        .select('user.id', 'id')
        .from('users', 'user')
        .where('user.id = :managerId', { managerId })
        .andWhere('user.client_id = :clientId', { clientId })
        .andWhere('user.role = :role', { role: 'MANAGER' })
        .andWhere('user.is_active = :isActive', { isActive: true })
        .getRawOne();

      if (!manager) {
        throw {
          statusCode: 404,
          message: 'Selected manager is not valid for this client',
          errorType: 'Validation Error',
        };
      }
      const existingInventory = await queryRunner.manager
        .createQueryBuilder(Entity.Inventory, 'inventory')
        .where('inventory.clientId = :clientId', { clientId })
        .andWhere('inventory.managerId = :managerId', { managerId })
        .andWhere('inventory.productId = :productId', { productId })
        .getOne();

      let inventoryId: string;
      if (existingInventory) {
        const previousQuantity = existingInventory.quantity;
        await queryRunner.manager
          .createQueryBuilder()
          .update(Entity.Inventory)
          .set({
            quantity: existingInventory.quantity + quantity,
          })
          .where('id = :id', { id: existingInventory.id })
          .execute();

        inventoryId = existingInventory.id;

        await this.auditService.createAuditLogWithQueryRunner(
          queryRunner,
          _user,
          {
            action: 'UPDATE',
            entity: 'INVENTORY',
            entityId: inventoryId,
            clientId,
            oldValue: { quantity: previousQuantity },
            newValue: { quantity: previousQuantity + quantity },
          },
        );
      } else {
        const newInventory = queryRunner.manager.create(Entity.Inventory, {
          id: uuidv4(),
          clientId,
          managerId,
          productId,
          quantity,
        });

        await queryRunner.manager.save(Entity.Inventory, newInventory);
        inventoryId = newInventory.id;

        await this.auditService.createAuditLogWithQueryRunner(
          queryRunner,
          _user,
          {
            action: 'CREATE',
            entity: 'INVENTORY',
            entityId: inventoryId,
            clientId,
            newValue: {
              managerId,
              productId,
              quantity,
            },
          },
        );
      }

      await queryRunner.commitTransaction();
      return this.apiResponse.success(
        'Stock distributed successfully',
        {
          inventoryId,
          clientId,
          managerId,
          productId,
          quantity,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      let statusCode = 422;
      let message = 'Stock distribution failed';
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

  async getClientInventory(_user: any) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const inventory = await queryRunner.manager
        .createQueryBuilder()
        .select([
          'inventory.id AS inventoryId',
          'inventory.product_id AS productId',
          'product.name AS productName',
          'inventory.manager_id AS managerId',
          'user.name AS managerName',
          'inventory.quantity AS quantity',
          'inventory.created_at AS createdAt',
        ])
        .from('inventory', 'inventory')
        .leftJoin('products', 'product', 'product.id = inventory.product_id')
        .leftJoin('users', 'user', 'user.id = inventory.manager_id')
        .where('inventory.client_id = :clientId', { clientId })
        .orderBy('inventory.created_at', 'DESC')
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

  async getProductInventory(_user: any, productId: string) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      if (!productId) {
        throw {
          statusCode: 422,
          message: 'productId is required',
          errorType: 'Validation Error',
        };
      }
      const inventory = await queryRunner.manager
        .createQueryBuilder()
        .select([
          'inventory.id AS inventoryId',
          'inventory.manager_id AS managerId',
          'user.name AS managerName',
          'inventory.quantity AS quantity',
          'inventory.created_at AS createdAt',
        ])
        .from('inventory', 'inventory')
        .leftJoin('users', 'user', 'user.id = inventory.manager_id')
        .where('inventory.client_id = :clientId', { clientId })
        .andWhere('inventory.product_id = :productId', { productId })
        .orderBy('inventory.created_at', 'DESC')
        .getRawMany();

      return this.apiResponse.success(
        'Product inventory fetched successfully',
        inventory,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch product inventory failed';
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

  async deleteInventory(_user: any, inventoryId: string) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!inventoryId) {
        throw {
          statusCode: 422,
          message: 'inventoryId is required',
          errorType: 'Validation Error',
        };
      }

      const existing = await queryRunner.manager
        .createQueryBuilder(Entity.Inventory, 'inventory')
        .where('inventory.id = :inventoryId', { inventoryId })
        .andWhere('inventory.clientId = :clientId', { clientId })
        .getOne();

      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Inventory not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager.delete(Entity.Inventory, {
        id: inventoryId,
        clientId,
      });

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'DELETE',
          entity: 'INVENTORY',
          entityId: inventoryId,
          clientId,
          oldValue: {
            managerId: existing.managerId,
            productId: existing.productId,
            quantity: existing.quantity,
          },
          newValue: null,
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Inventory deleted successfully',
        { inventoryId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      let statusCode = 422;
      let message = 'Delete inventory failed';
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
