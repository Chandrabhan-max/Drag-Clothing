import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponseService } from 'src/common/api-response.service';
import * as Entity from 'src/entities';
import { Role } from 'src/common/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from 'src/Modules/Audit-log/audit-log.service';

@Injectable()
export class ManagersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
    private readonly auditService: AuditService,
  ) {}

  async createManager(_user: any, dto: any) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .where('user.email = :email', { email: dto.email })
        .getOne();

      if (existing) {
        throw {
          statusCode: 422,
          message: 'Email already exists',
          errorType: 'Duplicate Email',
        };
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const manager = queryRunner.manager.create(Entity.User, {
        id: uuidv4(),
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: Role.MANAGER,
        clientId,
        isActive: true,
      });

      await queryRunner.manager.save(Entity.User, manager);
      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'CREATE',
          entity: 'MANAGER',
          entityId: manager.id,
          clientId,
          newValue: {
            name: manager.name,
            email: manager.email,
            role: manager.role,
          },
        },
      );
      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Manager created successfully',
        {
          managerId: manager.id,
          name: manager.name,
          email: manager.email,
        },
        201,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      let statusCode = 422;
      let message = 'Operation failed';
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

  async getManagers(_user: any) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const managers = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .select([
          'user.id AS managerId',
          'user.name AS name',
          'user.email AS email',
          'user.isActive AS isActive',
          'user.createdAt AS createdAt',
        ])
        .where('user.clientId = :clientId', { clientId })
        .andWhere('user.role = :role', { role: Role.MANAGER })
        .orderBy('user.createdAt', 'DESC')
        .getRawMany();

      return this.apiResponse.success(
        'Managers fetched successfully',
        managers,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch managers failed';
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

  async updateManager(_user: any, managerId: string, dto: any) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .where('user.id = :managerId', { managerId })
        .andWhere('user.clientId = :clientId', { clientId })
        .andWhere('user.role = :role', { role: Role.MANAGER })
        .getOne();

      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Manager not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.User)
        .set({
          name: dto.name,
          email: dto.email,
        })
        .where('id = :managerId', { managerId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'UPDATE',
          entity: 'MANAGER',
          entityId: managerId,
          clientId,
          oldValue: {
            name: existing.name,
            email: existing.email,
          },
          newValue: {
            name: dto.name,
            email: dto.email,
          },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Manager updated successfully',
        { managerId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Update manager failed';
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

  async deleteManager(_user: any, managerId: string) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .where('user.id = :managerId', { managerId })
        .andWhere('user.clientId = :clientId', { clientId })
        .andWhere('user.role = :role', { role: Role.MANAGER })
        .getOne();

      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Manager not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.User)
        .set({ isActive: false })
        .where('id = :managerId', { managerId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'DELETE',
          entity: 'MANAGER',
          entityId: managerId,
          clientId,
          oldValue: { isActive: existing.isActive },
          newValue: { isActive: false },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Manager deleted successfully',
        { managerId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Delete manager failed';
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

  async permadelete(_user: any, managerId: string) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .where('user.id = :managerId', { managerId })
        .andWhere('user.clientId = :clientId', { clientId })
        .andWhere('user.role = :role', {
          role: Role.MANAGER,
        })
        .getOne();
      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Manager not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Entity.User)
        .where('id = :managerId', { managerId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'DELETE',
          entity: 'MANAGER',
          entityId: managerId,
          clientId,
          oldValue: { isActive: true },
          newValue: {
            deleted: true,
          },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Manager deleted successfully',
        { managerId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Permanent Delete manager failed';
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

  async restoreManager(_user: any, managerId: string) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .where('user.id = :managerId', { managerId })
        .andWhere('user.clientId = :clientId', { clientId })
        .andWhere('user.role = :role', { role: Role.MANAGER })
        .getOne();

      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Manager not found',
          errorType: 'Not Found',
        };
      }

      if (existing.isActive) {
        throw {
          statusCode: 422,
          message: 'Manager already active',
          errorType: 'Already Active',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.User)
        .set({ isActive: true })
        .where('id = :managerId', { managerId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'RESTORE',
          entity: 'MANAGER',
          entityId: managerId,
          clientId,
          oldValue: { isActive: existing.isActive },
          newValue: { isActive: true },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Manager restored successfully',
        { managerId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      let statusCode = 422;
      let message = 'Restore manager failed';
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
