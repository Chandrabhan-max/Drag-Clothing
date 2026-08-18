import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as Entity from '../../entities';
import { ApiResponseService } from 'src/common/api-response.service';
import { QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuditService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}

  async createAuditLog(
    _user: any,
    body: {
      action: string;
      entity: string;
      entityId: string;
      clientId?: string;
      oldValue?: any;
      newValue?: any;
      ipAddress?: string;
    },
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Entity.AuditLog)
        .values({
          id: uuidv4(),
          userId: _user.id,
          clientId: body.clientId ?? _user.clientId ?? null,
          action: body.action,
          entity: body.entity,
          entityId: body.entityId,
          oldValue: body.oldValue ?? null,
          newValue: body.newValue ?? null,
          ipAddress: body.ipAddress,
        })
        .execute();

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Audit log created successfully',
        null,
        201,
      );
    } catch (error: any) {
      await queryRunner.rollbackTransaction();

      let statusCode = 500;
      let message = 'Audit log creation failed';
      let errorType = 'Internal Server Error';

      if (error.response) {
        statusCode = error.response.status ?? statusCode;
        message = error.response.data?.message ?? error.message ?? message;
      } else if (error.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      } else {
        message = error.message ?? message;
      }

      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createAuditLogWithQueryRunner(
    queryRunner: QueryRunner,
    _user: any,
    body: {
      action: string;
      entity: string;
      entityId: string;
      clientId?: string;
      oldValue?: any;
      newValue?: any;
      ipAddress?: string;
    },
  ) {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Entity.AuditLog)
      .values({
        id: uuidv4(),
        userId: _user.id,
        clientId: body.clientId ?? _user.clientId ?? null,
        action: body.action,
        entity: body.entity,
        entityId: body.entityId,
        oldValue: body.oldValue ?? null,
        newValue: body.newValue ?? null,
        ipAddress: body.ipAddress,
      })
      .execute();
  }

  async getAuditLogs(filters: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { startDate, endDate, page = 1, limit = 20 } = filters;

     
      if (!startDate) {
        throw {
          statusCode: 400,
          message: 'startDate is required',
          errorType: 'Bad Request',
        };
      }

      const skip = (page - 1) * limit;

      const qb = queryRunner.manager
        .createQueryBuilder(Entity.AuditLog, 'log')
        .orderBy('log.createdAt', 'DESC')
        .andWhere('log.createdAt >= :startDate', {
          startDate: new Date(`${startDate}T00:00:00.000`),
        });

      if (endDate) {
        const endDateTime = new Date(`${endDate}T23:59:59.999`);
        qb.andWhere('log.createdAt <= :endDate', {
          endDate: endDateTime,
        });
      }

      const [logs, total] = await qb.skip(skip).take(limit).getManyAndCount();

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Audit logs fetched successfully',
        {
          total,
          page,
          limit,
          data: logs,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 500;
      let message = 'Failed to fetch audit logs';
      let errorType = 'Internal Server Error';

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
