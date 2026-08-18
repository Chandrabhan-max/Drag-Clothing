import { HttpException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as Entity from '../../../entities';
import { ApiResponseService } from 'src/common/api-response.service';
@Injectable()
export class DashboardService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}
  async getDashboard(user: any) {
    const userId = user?.id;
    if (!userId) {
      throw {
        statusCode: 401,
        message: 'Invalid session',
        errorType: 'Unauthorized',
      };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const totalClients = await queryRunner.manager
        .createQueryBuilder(Entity.Client, 'c')
        .getCount();

      const activeClients = await queryRunner.manager
        .createQueryBuilder(Entity.Client, 'c')
        .where('c.isActive=:isActive', { isActive: true })
        .getCount();

      const inactiveClients = await queryRunner.manager
        .createQueryBuilder(Entity.Client, 'c')
        .where('c.isActive=:isActive', { isActive: false })
        .getCount();

      const totalUsers = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'u')
        .getCount();

      const activeUsers = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'u')
        .where('u.isActive=:isActive', { isActive: true })
        .getCount();

      const inactiveUsers = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'u')
        .where('u.isActive=:isActive', { isActive: false })
        .getCount();

      return this.apiResponse.success(
        'Dashboard fetched successfully',
        {
          totalClients,
          activeClients,
          inactiveClients,
          totalUsers,
          activeUsers,
          inactiveUsers,
        },
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch dashboard failed';
      let errorType = 'Unprocessable Request';

      if (error.response) {
        statusCode = error.response.status ?? 422;
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
}
