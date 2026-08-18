import { HttpException, Injectable } from '@nestjs/common';
import { CreateClientDto } from './Dto/create-client.dto';
import { DataSource } from 'typeorm';
import { ApiResponseService } from 'src/common/api-response.service';
import * as Entity from '../../entities';
import { UpdateClientDto } from './Dto/update-client.dto';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enums/role.enum';
import { CreateUserDto } from './Dto/create-user.dto';
import { UpdateUserDto } from './Dto/update-user.dto';
import { AuditService } from 'src/Modules/Audit-log/audit-log.service';
@Injectable()
export class AdminService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
    private readonly auditService: AuditService,
  ) {}

  async createClient(_user: any, body: CreateClientDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const email = body.email.trim().toLowerCase();

      const existingClient = await queryRunner.manager
        .createQueryBuilder(Entity.Client, 'c')
        .where('c.email = :email', { email })
        .getOne();

      if (existingClient) {
        throw {
          statusCode: 422,
          message: 'Client with this email already exists',
          errorType: 'Duplicate Entry',
        };
      }

      const existingUser = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'u')
        .where('u.email = :email', { email })
        .getOne();

      if (existingUser) {
        throw {
          statusCode: 422,
          message: 'User with this email already exists',
          errorType: 'Duplicate Entry',
        };
      }

      const clientResult = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Entity.Client)
        .values({
          name: body.name,
          email: email,
          phone: body.phone,
          address: body.address ?? null,
          isActive: true,
        })
        .execute();

      const clientId = clientResult.identifiers[0].id;

      const hashedPassword = await bcrypt.hash(body.password, 10);

      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Entity.User)
        .values({
          name: body.name,
          email: email,
          password: hashedPassword,
          role: Role.CLIENT,
          clientId: clientId,
          isActive: true,
        })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'CREATE',
          entity: 'CLIENT',
          entityId: clientId,
          clientId,
          newValue: {
            name: body.name,
            email,
            phone: body.phone,
            address: body.address ?? null,
          },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Client created successfully',
        {
          clientId: clientId,
          loginEmail: email,
        },
        201,
      );
    } catch (error: any) {
      await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Create client failed';
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

  async getAllClients(user: any) {
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
      const clients = await queryRunner.manager
        .createQueryBuilder(Entity.Client, 'c')
        .select([
          'c.id AS id',
          'c.name AS name',
          'c.email AS email',
          'c.phone AS phone',
          'c.address AS address',
          'c.isActive AS isActive',
          'c.createdAt AS createdAt',
        ])
        .orderBy('c.createdAt', 'DESC')
        .getRawMany();

      return this.apiResponse.success(
        'Clients fetched successfully',
        clients,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Get clients failed';
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

  async getClientsbyid(user: any, clientId: string) {
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
      const Client = await queryRunner.manager
        .createQueryBuilder(Entity.Client, 'c')
        .select([
          'c.id AS id',
          'c.name AS name',
          'c.email AS email',
          'c.phone AS phone',
          'c.address AS address',
          'c.isActive AS isActive',
          'c.createdAt AS createdAt',
        ])
        .where('c.id = :clientId', { clientId })
        .getRawOne();

      if (!Client) {
        throw {
          statusCode: 404,
          message: 'Client not found',
          errorType: 'Not Found',
        };
      }

      return this.apiResponse.success(
        'Client fetched successfully',
        Client,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Get client failed';
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

  async updateClient(user: any, clientId: string, body: UpdateClientDto) {
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
    await queryRunner.startTransaction();

    try {
      const existingClient = await queryRunner.manager
        .createQueryBuilder(Entity.Client, 'c')
        .where('c.id=:clientId', { clientId })
        .getOne();

      if (!existingClient) {
        throw {
          statusCode: 404,
          message: 'Client not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.Client)
        .set({
          ...(body.name !== undefined && { name: body.name }),
          ...(body.email !== undefined && { email: body.email }),
          ...(body.phone !== undefined && { phone: body.phone }),
          ...(body.address !== undefined && { address: body.address }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
        })
        .where('id=:clientId', { clientId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(queryRunner, user, {
        action: 'UPDATE',
        entity: 'CLIENT',
        entityId: clientId,
        clientId,
        oldValue: {
          name: existingClient.name,
          email: existingClient.email,
          phone: existingClient.phone,
          address: existingClient.address,
          isActive: existingClient.isActive,
        },
        newValue: {
          name: body.name ?? existingClient.name,
          email: body.email ?? existingClient.email,
          phone: body.phone ?? existingClient.phone,
          address: body.address ?? existingClient.address,
          isActive: body.isActive ?? existingClient.isActive,
        },
      });

      await queryRunner.commitTransaction();

      return this.apiResponse.success('Client updated successfully', null, 200);
    } catch (error: any) {
      await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Update client failed';
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

  async deleteClient(user: any, clientId: string) {
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
    await queryRunner.startTransaction();

    try {
      const existingClient = await queryRunner.manager
        .createQueryBuilder(Entity.Client, 'c')
        .where('c.id=:clientId', { clientId })
        .andWhere('c.isActive=:isActive', { isActive: true })
        .getOne();

      if (!existingClient) {
        throw {
          statusCode: 404,
          message: 'Client not found or already deleted',
          errorType: 'Not Found',
        };
      }
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.Client)
        .set({ isActive: false })
        .where('id=:clientId', { clientId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(queryRunner, user, {
        action: 'DELETE',
        entity: 'CLIENT',
        entityId: clientId,
        clientId,
        oldValue: { isActive: existingClient.isActive },
        newValue: { isActive: false },
      });

      await queryRunner.commitTransaction();
      return this.apiResponse.success('Client deleted successfully', null, 200);
    } catch (error: any) {
      await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Delete client failed';
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

  async hardDeleteClient(user: any, clientId: string) {
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
    await queryRunner.startTransaction();

    try {
      const existingClient = await queryRunner.manager
        .createQueryBuilder(Entity.Client, 'c')
        .where('c.id=:clientId', { clientId })
        .getOne();

      if (!existingClient) {
        throw {
          statusCode: 404,
          message: 'Client not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Entity.User)
        .where('clientId=:clientId', { clientId })
        .execute();

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Entity.Client)
        .where('id=:clientId', { clientId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(queryRunner, user, {
        action: 'HARD_DELETE',
        entity: 'CLIENT',
        entityId: clientId,
        clientId,
        oldValue: {
          name: existingClient.name,
          email: existingClient.email,
          phone: existingClient.phone,
          address: existingClient.address,
          isActive: existingClient.isActive,
        },
      });

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Client permanently deleted successfully',
        null,
        200,
      );
    } catch (error: any) {
      await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Hard delete client failed';
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

  async restoreClient(user: any, clientId: string) {
    if (!user?.id) {
      throw {
        statusCode: 401,
        message: 'Invalid session',
        errorType: 'Unauthorized',
      };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const client = await queryRunner.manager
        .createQueryBuilder(Entity.Client, 'c')
        .where('c.id=:clientId', { clientId })
        .getOne();

      if (!client) {
        throw {
          statusCode: 404,
          message: 'Client not found',
          errorType: 'Not Found',
        };
      }

      if (client.isActive) {
        await queryRunner.rollbackTransaction();

        return this.apiResponse.success('Client already active', null, 200);
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.Client)
        .set({ isActive: true })
        .where('id=:clientId', { clientId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(queryRunner, user, {
        action: 'RESTORE',
        entity: 'CLIENT',
        entityId: clientId,
        clientId,
        oldValue: { isActive: client.isActive },
        newValue: { isActive: true },
      });

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Client restored successfully',
        null,
        200,
      );
    } catch (error: any) {
      await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Restore client failed';
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

  async createUser(_user: any, body: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const email = body.email.trim().toLowerCase();
      const existingUser = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'u')
        .where('u.email = :email', { email })
        .getOne();

      if (existingUser) {
        throw {
          statusCode: 422,
          message: 'User with this email already exists',
          errorType: 'Duplicate Entry',
        };
      }

      const hashedPassword = await bcrypt.hash(body.password, 10);

      const result = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Entity.User)
        .values({
          email: email,
          password: hashedPassword,
          name: `${body.firstName}${body.lastName ? ` ${body.lastName}` : ''}`,
          phone: body.phone,
          role: body.role,
          clientId: body.clientId,
          isActive: true,
        })
        .execute();

      const createdUserId = result.identifiers[0].id;
      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'CREATE',
          entity: 'USER',
          entityId: createdUserId,
          clientId: body.clientId,
          newValue: {
            email,
            role: body.role,
            clientId: body.clientId,
          },
        },
      );

      await queryRunner.commitTransaction();
      return this.apiResponse.success(
        'User created successfully',
        {
          userId: result.identifiers[0].id,
        },
        201,
      );
    } catch (error: any) {
      await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Create user failed';
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

  async getAllUsersHierarchical(user: any) {
    try {
      const superAdmin = await this.dataSource
        .createQueryBuilder()
        // ADDED 'u.isActive' BELOW
        .select(['u.id', 'u.email', 'u.name', 'u.role', 'u.isActive'])
        .from(Entity.User, 'u')
        .where('u.role = :role', { role: Role.SUPER_ADMIN })
        .getOne();

      const clients = await this.dataSource
        .createQueryBuilder()
        // ADDED 'u.isActive' BELOW
        .select(['u.id', 'u.email', 'u.name', 'u.clientId', 'u.isActive'])
        .from(Entity.User, 'u')
        .where('u.role = :role', { role: Role.CLIENT })
        .getMany();

      const managers = await this.dataSource
        .createQueryBuilder()
        // ADDED 'u.isActive' BELOW
        .select(['u.id', 'u.email', 'u.name', 'u.clientId', 'u.isActive'])
        .from(Entity.User, 'u')
        .where('u.role = :role', { role: Role.MANAGER })
        .getMany();

      const clientHierarchy = clients.map((client) => {
        const clientManagers = managers.filter(
          (manager) => manager.clientId === client.clientId,
        );
        return {
          client: client,
          managers: clientManagers,
        };
      });

      return this.apiResponse.success(
        'Users fetched successfully',
        { superAdmin, clients: clientHierarchy },
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch users failed';
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
    }
  }

  async getUserById(_user: any, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const user = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'u')
        .select([
          'u.id',
          'u.email',
          'u.name',
          'u.phone',
          'u.role',
          'u.clientId',
          'u.isActive',
          'u.createdAt',
          'u.updatedAt',
        ])
        .where('u.id = :userId', { userId })
        .getOne();

      if (!user) {
        throw {
          statusCode: 404,
          message: 'User not found',
          errorType: 'Not Found',
        };
      }
      return this.apiResponse.success('User fetched successfully', user, 200);
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      let statusCode = 422;
      let message = 'Fetch user failed';
      let errorType = 'Unprocessable Request';

      if (error?.response) {
        statusCode = error.response.status ?? 422;
        message =
          error.response.data?.message ??
          error.response.message ??
          error.message ??
          message;
      } else if (error?.statusCode) {
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

  async updateUser(_user: any, userId: string, body: UpdateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await queryRunner.manager.findOne(Entity.User, {
        where: { id: userId },
      });
      if (!existingUser) {
        throw {
          statusCode: 404,
          message: 'User not found',
          errorType: 'Not Found',
        };
      }

      const oldUserValue = {
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone,
        role: existingUser.role,
        clientId: existingUser.clientId,
        isActive: existingUser.isActive,
      };

      if (body.name !== undefined) {
        existingUser.name = body.name;
      }

      if (body.email !== undefined) {
        existingUser.email = body.email.trim().toLowerCase();
      }

      if (body.phone !== undefined) {
        existingUser.phone = body.phone;
      }

      if (body.role !== undefined) {
        existingUser.role = body.role;
      }

      if (body.clientId !== undefined) {
        existingUser.clientId = body.clientId;
      }

      if (body.isActive !== undefined) {
        existingUser.isActive = body.isActive;
      }

      await queryRunner.manager.save(Entity.User, existingUser);
      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'UPDATE',
          entity: 'USER',
          entityId: existingUser.id,
          clientId: existingUser.clientId,
          oldValue: oldUserValue,
          newValue: {
            name: existingUser.name,
            email: existingUser.email,
            phone: existingUser.phone,
            role: existingUser.role,
            clientId: existingUser.clientId,
            isActive: existingUser.isActive,
          },
        },
      );
      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'User updated successfully',
        {
          userId: existingUser.id,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      let statusCode = 422;
      let message = 'Update user failed';
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

  async deleteUser(_user: any, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await queryRunner.manager.findOne(Entity.User, {
        where: { id: userId },
      });

      if (!existingUser) {
        throw {
          statusCode: 404,
          message: 'User not found',
          errorType: 'Not Found',
        };
      }
      if (!existingUser.isActive) {
        throw {
          statusCode: 422,
          message: 'User already deleted',
          errorType: 'Already Deleted',
        };
      }
      const wasActive = existingUser.isActive;
      existingUser.isActive = false;
      await queryRunner.manager.save(Entity.User, existingUser);
      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'DELETE',
          entity: 'USER',
          entityId: existingUser.id,
          clientId: existingUser.clientId,
          oldValue: { isActive: wasActive },
          newValue: { isActive: false },
        },
      );
      await queryRunner.commitTransaction();
      return this.apiResponse.success(
        'User deleted successfully',
        {
          userId: existingUser.id,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      let statusCode = 422;
      let message = 'Delete user failed';
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

  async restoreUser(_user: any, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await queryRunner.manager.findOne(Entity.User, {
        where: { id: userId },
      });
      if (!existingUser) {
        throw {
          statusCode: 404,
          message: 'User not found',
          errorType: 'Not Found',
        };
      }
      if (existingUser.isActive) {
        throw {
          statusCode: 422,
          message: 'User already active',
          errorType: 'Already Active',
        };
      }
      const wasActive = existingUser.isActive;
      existingUser.isActive = true;
      await queryRunner.manager.save(Entity.User, existingUser);
      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'RESTORE',
          entity: 'USER',
          entityId: existingUser.id,
          clientId: existingUser.clientId,
          oldValue: { isActive: wasActive },
          newValue: { isActive: true },
        },
      );
      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'User restored successfully',
        {
          userId: existingUser.id,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      let statusCode = 422;
      let message = 'Restore user failed';
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

  async getAllCustomers(user: any) {
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
      // Queries the exact columns from your customers table
      const customers = await queryRunner.manager
        .createQueryBuilder(Entity.Customer, 'c')
        .withDeleted()
        .select([
          'c.id AS id',
          'c.name AS name',
          'c.email AS email',
          'c.phone AS phone',
          'c.address AS address',
          'c.clientId AS client_id',
          'c.status AS status',
          'c.deletedAt AS deleted_at',
        ])
        .orderBy('c.createdAt', 'DESC')
        .getRawMany();

      return this.apiResponse.success(
        'Customers fetched successfully',
        customers,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Get customers failed';
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

  async updateCustomer(user: any, customerId: string, body: any) {
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
    await queryRunner.startTransaction();

    try {
      const existingCustomer = await queryRunner.manager
        .createQueryBuilder(Entity.Customer, 'c')
        .where('c.id = :customerId', { customerId })
        .getOne();

      if (!existingCustomer) {
        throw {
          statusCode: 404,
          message: 'Customer not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.Customer)
        .set({
          ...(body.name !== undefined && { name: body.name }),
          ...(body.email !== undefined && {
            email: body.email.trim().toLowerCase(),
          }),
          ...(body.phone !== undefined && { phone: body.phone }),
          ...(body.clientId !== undefined && { clientId: body.clientId }),
        })
        .where('id = :customerId', { customerId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(queryRunner, user, {
        action: 'UPDATE',
        entity: 'CUSTOMER',
        entityId: customerId,
        clientId: existingCustomer.clientId,
        oldValue: {
          name: existingCustomer.name,
          email: existingCustomer.email,
          phone: existingCustomer.phone,
          clientId: existingCustomer.clientId,
        },
        newValue: {
          name: body.name ?? existingCustomer.name,
          email: body.email ?? existingCustomer.email,
          phone: body.phone ?? existingCustomer.phone,
          clientId: body.clientId ?? existingCustomer.clientId,
        },
      });

      await queryRunner.commitTransaction();
      return this.apiResponse.success(
        'Customer updated successfully',
        null,
        200,
      );
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      const statusCode = error.response?.status ?? error.statusCode ?? 422;
      const message =
        error.response?.data?.message ??
        error.message ??
        'Update customer failed';
      const errorType = error.errorType ?? 'Unprocessable Request';
      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCustomer(user: any, customerId: string) {
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
    await queryRunner.startTransaction();

    try {
      const existingCustomer = await queryRunner.manager
        .createQueryBuilder(Entity.Customer, 'c')
        .where('c.id = :customerId', { customerId })
        .getOne();

      if (!existingCustomer || existingCustomer.status === 'INACTIVE') {
        throw {
          statusCode: 404,
          message: 'Customer not found or already deleted',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.Customer)
        .set({ status: 'INACTIVE', deletedAt: new Date() })
        .where('id = :customerId', { customerId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(queryRunner, user, {
        action: 'DELETE',
        entity: 'CUSTOMER',
        entityId: customerId,
        clientId: existingCustomer.clientId,
        oldValue: { status: existingCustomer.status },
        newValue: { status: 'INACTIVE' },
      });

      await queryRunner.commitTransaction();
      return this.apiResponse.success(
        'Customer moved to bin successfully',
        null,
        200,
      );
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      const statusCode = error.response?.status ?? error.statusCode ?? 422;
      const message =
        error.response?.data?.message ??
        error.message ??
        'Delete customer failed';
      const errorType = error.errorType ?? 'Unprocessable Request';
      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async hardDeleteCustomer(user: any, customerId: string) {
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
    await queryRunner.startTransaction();

    try {
      const existingCustomer = await queryRunner.manager
        .createQueryBuilder(Entity.Customer, 'c')
        .where('c.id = :customerId', { customerId })
        .getOne();

      if (!existingCustomer) {
        throw {
          statusCode: 404,
          message: 'Customer not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Entity.Customer)
        .where('id = :customerId', { customerId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(queryRunner, user, {
        action: 'HARD_DELETE',
        entity: 'CUSTOMER',
        entityId: customerId,
        clientId: existingCustomer.clientId,
        oldValue: {
          name: existingCustomer.name,
          email: existingCustomer.email,
          status: existingCustomer.status,
        },
      });

      await queryRunner.commitTransaction();
      return this.apiResponse.success(
        'Customer permanently deleted',
        null,
        200,
      );
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      const statusCode = error.response?.status ?? error.statusCode ?? 422;
      const message =
        error.response?.data?.message ??
        error.message ??
        'Hard delete customer failed';
      const errorType = error.errorType ?? 'Unprocessable Request';
      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async restoreCustomer(user: any, customerId: string) {
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
    await queryRunner.startTransaction();

    try {
      const customer = await queryRunner.manager
        .createQueryBuilder(Entity.Customer, 'c')
        .withDeleted() // <--- THIS IS THE MAGIC LINE TO FIND ITEMS IN THE BIN!
        .where('c.id = :customerId', { customerId })
        .getOne();

      if (!customer) {
        throw {
          statusCode: 404,
          message: 'Customer not found',
          errorType: 'Not Found',
        };
      }

      if (customer.status === 'ACTIVE' && !customer.deletedAt) {
        await queryRunner.rollbackTransaction();
        return this.apiResponse.success(
          'Customer is already active',
          null,
          200,
        );
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.Customer)
        .set({ status: 'ACTIVE', deletedAt: null })
        .where('id = :customerId', { customerId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(queryRunner, user, {
        action: 'RESTORE',
        entity: 'CUSTOMER',
        entityId: customerId,
        clientId: customer.clientId,
        oldValue: { status: customer.status },
        newValue: { status: 'ACTIVE' },
      });

      await queryRunner.commitTransaction();
      return this.apiResponse.success(
        'Customer restored successfully',
        null,
        200,
      );
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      const statusCode = error.response?.status ?? error.statusCode ?? 422;
      const message =
        error.response?.data?.message ??
        error.message ??
        'Restore customer failed';
      const errorType = error.errorType ?? 'Unprocessable Request';
      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async hardDeleteUser(_user: any, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await queryRunner.manager.findOne(Entity.User, {
        where: { id: userId },
      });

      if (!existingUser) {
        throw {
          statusCode: 404,
          message: 'User not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Entity.User)
        .where('id = :userId', { userId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'HARD_DELETE',
          entity: 'USER',
          entityId: userId,
          clientId: existingUser.clientId,
          oldValue: {
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
          },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'User permanently deleted successfully',
        null,
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      let statusCode = 422;
      let message = 'Hard delete user failed';
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
