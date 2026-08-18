import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Client, Customer, Otp, User } from 'src/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enums/role.enum';
import { RegisterDto } from './Dto/register.dto';
import { ChangePasswordDto } from './Dto/change-password.dto';
import { LoginDto } from './Dto/login.dto';
import { MailService } from './mail.service';
import { AuditService } from '../Audit-log/audit-log.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private static readonly CUSTOMER_ACTIVE_STATUS = 'ACTIVE';

  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(Client)
    private clientsRepo: Repository<Client>,

    @InjectRepository(Customer)
    private customersRepo: Repository<Customer>,

    @InjectRepository(Otp)
    private otpRepo: Repository<Otp>,

    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private isCustomerActive(customer: Customer) {
    return (
      customer.status === AuthService.CUSTOMER_ACTIVE_STATUS &&
      !customer.deletedAt
    );
  }

  private async generateTokens(payload: {
    id: string;
    email: string;
    role: Role;
    clientId?: string;
    subjectType: 'user' | 'customer';
  }) {
    const tokenPayload = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      clientId: payload.clientId ?? null,
      subjectType: payload.subjectType,
    };

    const accessToken = this.jwt.sign(tokenPayload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '1d',
    });

    const refreshToken = this.jwt.sign(tokenPayload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    if (payload.subjectType === 'customer') {
      await this.customersRepo.update(payload.id, {
        refreshToken: hashedRefreshToken,
      });
    } else {
      await this.usersRepo.update(payload.id, {
        refreshToken: hashedRefreshToken,
      });
    }

    return {
      accessToken,
      refreshToken,
    };
  }
  private async ensureClientActive(clientId?: string) {
    if (!clientId) return;

    const client = await this.clientsRepo.findOne({
      where: { id: clientId },
      select: ['id', 'isActive'],
    });

    if (!client || !client.isActive) {
      throw new UnauthorizedException('Client inactive');
    }
  }

  async register(dto: RegisterDto) {
    const email = this.normalizeEmail(dto.email);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [customerExists, userExists] = await Promise.all([
        queryRunner.manager.findOne(Customer, { where: { email } }),
        queryRunner.manager.findOne(User, { where: { email } }),
      ]);

      if (customerExists || userExists) {
        throw new BadRequestException('Email exists');
      }

      const hash = await bcrypt.hash(dto.password, 10);

      const customer = queryRunner.manager.create(Customer, {
        name: dto.name,
        email,
        password: hash,
        status: AuthService.CUSTOMER_ACTIVE_STATUS,
        clientId: dto.clientId,
      });

      const savedCustomer = await queryRunner.manager.save(Customer, customer);
      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        { id: savedCustomer.id, clientId: savedCustomer.clientId },
        {
          action: 'REGISTER',
          entity: 'CUSTOMER',
          entityId: savedCustomer.id,
          clientId: savedCustomer.clientId,
          newValue: {
            email: savedCustomer.email,
            name: savedCustomer.name,
            status: savedCustomer.status,
          },
        },
      );

      await queryRunner.commitTransaction();

      return {
        id: savedCustomer.id,
        name: savedCustomer.name,
        email: savedCustomer.email,
        phone: savedCustomer.phone,
        address: savedCustomer.address,
        clientId: savedCustomer.clientId,
        status: savedCustomer.status,
        createdAt: savedCustomer.createdAt,
        updatedAt: savedCustomer.updatedAt,
      };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginDto) {
    const email = this.normalizeEmail(dto.email);

    const user = await this.usersRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'isActive', 'clientId'],
    });

    if (user) {
      if (!user.isActive) {
        throw new UnauthorizedException('Account is inactive');
      }

      const match = await bcrypt.compare(dto.password, user.password);

      if (!match) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (user.role === Role.CLIENT || user.role === Role.MANAGER) {
        await this.ensureClientActive(user.clientId);
      }

      return this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role as Role,
        clientId: user.clientId,
        subjectType: 'user',
      });
    }

    const customer = await this.customersRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'status', 'clientId', 'deletedAt'],
    });

    if (customer) {
      if (!this.isCustomerActive(customer)) {
        throw new UnauthorizedException('Account is inactive');
      }

      await this.ensureClientActive(customer.clientId);

      const match = await bcrypt.compare(dto.password, customer.password);

      if (!match) {
        throw new UnauthorizedException('Invalid email or password');
      }

      return this.generateTokens({
        id: customer.id,
        email: customer.email,
        role: Role.CUSTOMER,
        clientId: customer.clientId,
        subjectType: 'customer',
      });
    }

    throw new UnauthorizedException('Invalid email or password');
  }

  async refresh(user: {
    id: string;
    subjectType?: 'user' | 'customer';
    refreshToken: string;
  }) {
    const subjectType = user.subjectType === 'customer' ? 'customer' : 'user';
    if (subjectType === 'customer') {
      const dbCustomer = await this.customersRepo.findOne({
        where: { id: user.id },
        select: [
          'id',
          'email',
          'status',
          'refreshToken',
          'clientId',
          'deletedAt',
        ],
      });

      if (!dbCustomer || !dbCustomer.refreshToken) {
        throw new UnauthorizedException();
      }

      if (!this.isCustomerActive(dbCustomer)) {
        throw new UnauthorizedException('Account inactive');
      }

      await this.ensureClientActive(dbCustomer.clientId);

      const match = await bcrypt.compare(
        user.refreshToken,
        dbCustomer.refreshToken,
      );
      if (!match) {
        throw new UnauthorizedException();
      }

      return this.generateTokens({
        id: dbCustomer.id,
        email: dbCustomer.email,
        role: Role.CUSTOMER,
        clientId: dbCustomer.clientId,
        subjectType: 'customer',
      });
    }

    const dbUser = await this.usersRepo.findOne({
      where: { id: user.id },
      select: ['id', 'email', 'role', 'refreshToken', 'isActive', 'clientId'],
    });

    if (!dbUser || !dbUser.refreshToken) {
      throw new UnauthorizedException();
    }

    if (!dbUser.isActive) {
      throw new UnauthorizedException('Account inactive');
    }

    await this.ensureClientActive(dbUser.clientId);

    const match = await bcrypt.compare(user.refreshToken, dbUser.refreshToken);
    if (!match) {
      throw new UnauthorizedException();
    }

    return this.generateTokens({
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role as Role,
      clientId: dbUser.clientId,
      subjectType: 'user',
    });
  }

  async logout(authUser: { id: string; subjectType?: 'user' | 'customer' }) {
    if (!authUser?.id) {
      throw new BadRequestException('User id is required');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const subjectType =
        authUser.subjectType === 'customer' ? 'customer' : 'user';
      if (subjectType === 'customer') {
        const customer = await queryRunner.manager.findOne(Customer, {
          where: { id: authUser.id },
          select: ['id', 'refreshToken', 'clientId'],
        });

        if (!customer) {
          throw new UnauthorizedException('User not found');
        }

        if (!customer.refreshToken) {
          throw new BadRequestException('User already logged out');
        }

        await queryRunner.manager.update(Customer, authUser.id, {
          refreshToken: null,
        });

        await this.auditService.createAuditLogWithQueryRunner(
          queryRunner,
          { id: customer.id, clientId: customer.clientId },
          {
            action: 'LOGOUT',
            entity: 'CUSTOMER',
            entityId: customer.id,
            clientId: customer.clientId,
            oldValue: { refreshToken: 'SET' },
            newValue: { refreshToken: null },
          },
        );
      } else {
        const user = await queryRunner.manager.findOne(User, {
          where: { id: authUser.id },
          select: ['id', 'refreshToken', 'clientId'],
        });

        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        if (!user.refreshToken) {
          throw new BadRequestException('User already logged out');
        }

        await queryRunner.manager.update(User, authUser.id, {
          refreshToken: null,
        });

        await this.auditService.createAuditLogWithQueryRunner(
          queryRunner,
          { id: user.id, clientId: user.clientId },
          {
            action: 'LOGOUT',
            entity: 'USER',
            entityId: user.id,
            clientId: user.clientId,
            oldValue: { refreshToken: 'SET' },
            newValue: { refreshToken: null },
          },
        );
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Logged out successfully',
      };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async me(authUser: { id: string; subjectType?: 'user' | 'customer' }) {
    if (!authUser?.id) {
      throw new UnauthorizedException('Invalid token');
    }

    const subjectType =
      authUser.subjectType === 'customer' ? 'customer' : 'user';
    if (subjectType === 'customer') {
      const customer = await this.customersRepo.findOne({
        where: { id: authUser.id },
        select: [
          'id',
          'email',
          'name',
          'phone',
          'address',
          'status',
          'clientId',
          'createdAt',
          'updatedAt',
          'deletedAt',
        ],
      });

      if (!customer) {
        throw new UnauthorizedException('User not found');
      }

      if (!this.isCustomerActive(customer)) {
        throw new UnauthorizedException('Account inactive');
      }

      await this.ensureClientActive(customer.clientId);

      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        role: Role.CUSTOMER,
        clientId: customer.clientId,
        status: customer.status,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      };
    }

    const user = await this.usersRepo.findOne({
      where: { id: authUser.id },
      select: ['id', 'email', 'name', 'role', 'isActive', 'clientId'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account inactive');
    }

    await this.ensureClientActive(user.clientId);

    return user;
  }

  async changePassword(
    authUser: { id: string; subjectType?: 'user' | 'customer' },
    dto: ChangePasswordDto,
  ) {
    if (!authUser?.id) {
      throw new UnauthorizedException('Invalid token');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const subjectType =
        authUser.subjectType === 'customer' ? 'customer' : 'user';
      if (subjectType === 'customer') {
        const customer = await queryRunner.manager.findOne(Customer, {
          where: { id: authUser.id },
          select: ['id', 'password', 'status', 'clientId', 'deletedAt'],
        });

        if (!customer) {
          throw new UnauthorizedException();
        }

        if (!this.isCustomerActive(customer)) {
          throw new UnauthorizedException('Account inactive');
        }

        await this.ensureClientActive(customer.clientId);

        const match = await bcrypt.compare(
          dto.currentPassword,
          customer.password,
        );
        if (!match) {
          throw new UnauthorizedException();
        }

        customer.password = await bcrypt.hash(dto.newPassword, 10);
        await queryRunner.manager.save(Customer, customer);
        await this.auditService.createAuditLogWithQueryRunner(
          queryRunner,
          { id: customer.id, clientId: customer.clientId },
          {
            action: 'CHANGE_PASSWORD',
            entity: 'CUSTOMER',
            entityId: customer.id,
            clientId: customer.clientId,
            oldValue: { password: 'REDACTED' },
            newValue: { password: 'REDACTED' },
          },
        );
      } else {
        const user = await queryRunner.manager.findOne(User, {
          where: { id: authUser.id },
          select: ['id', 'password', 'isActive', 'clientId'],
        });

        if (!user) {
          throw new UnauthorizedException();
        }

        if (!user.isActive) {
          throw new UnauthorizedException('Account inactive');
        }

        await this.ensureClientActive(user.clientId);

        const match = await bcrypt.compare(dto.currentPassword, user.password);
        if (!match) {
          throw new UnauthorizedException();
        }

        user.password = await bcrypt.hash(dto.newPassword, 10);
        await queryRunner.manager.save(User, user);
        await this.auditService.createAuditLogWithQueryRunner(
          queryRunner,
          { id: user.id, clientId: user.clientId },
          {
            action: 'CHANGE_PASSWORD',
            entity: 'USER',
            entityId: user.id,
            clientId: user.clientId,
            oldValue: { password: 'REDACTED' },
            newValue: { password: 'REDACTED' },
          },
        );
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Password changed',
      };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async SendOtp(email: string) {
    const normalizedEmail = this.normalizeEmail(email);

    const user = await this.usersRepo.findOne({
      where: { email: normalizedEmail },
      select: ['id', 'email', 'isActive', 'clientId', 'role'],
    });

    const customer = user
      ? null
      : await this.customersRepo.findOne({
          where: { email: normalizedEmail },
          select: ['id', 'email', 'status', 'clientId', 'deletedAt'],
        });

    if (!user && !customer) {
      throw new UnauthorizedException('Account not found');
    }

    if (user) {
      if (!user.isActive) {
        throw new UnauthorizedException('Account inactive');
      }

      if (user.role === 'client' || user.role === 'manager') {
        await this.ensureClientActive(user.clientId);
      }
    }

    if (customer) {
      if (!this.isCustomerActive(customer)) {
        throw new UnauthorizedException('Account inactive');
      }

      await this.ensureClientActive(customer.clientId);
    }

    const lastOtp = await this.otpRepo.findOne({
      where: { email: normalizedEmail },
      order: { createdAt: 'DESC' },
    });

    if (lastOtp) {
      const diff = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
      if (diff < 60) {
        throw new BadRequestException(
          'Please wait before requesting OTP again',
        );
      }
    }

    const otp = this.generateOtp();

    await this.otpRepo.save({
      email: normalizedEmail,
      otp,
      isUsed: false,
    });

    await this.mailService.sendOtp(normalizedEmail, otp);

    return {
      message: 'OTP sent successfully',
    };
  }

  async VerifyOtp(email: string, otp: string) {
    const normalizedEmail = this.normalizeEmail(email);

    const otpRecord = await this.otpRepo.findOne({
      where: {
        email: normalizedEmail,
        otp,
        isUsed: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const expirySeconds = 300;

    const diff = (Date.now() - otpRecord.createdAt.getTime()) / 1000;

    if (diff > expirySeconds) {
      throw new UnauthorizedException('OTP expired');
    }

    await this.otpRepo.update(otpRecord.id, {
      isUsed: true,
    });

    const user = await this.usersRepo.findOne({
      where: { email: normalizedEmail },
      select: ['id', 'email', 'role', 'isActive', 'clientId'],
    });

    if (user) {
      if (!user.isActive) {
        throw new UnauthorizedException('Account inactive');
      }

      if (user.role === 'client' || user.role === 'manager') {
        await this.ensureClientActive(user.clientId);
      }

      return this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role as Role,
        clientId: user.clientId,
        subjectType: 'user',
      });
    }

    const customer = await this.customersRepo.findOne({
      where: { email: normalizedEmail },
      select: ['id', 'email', 'status', 'clientId', 'deletedAt'],
    });

    if (customer) {
      if (!this.isCustomerActive(customer)) {
        throw new UnauthorizedException('Account inactive');
      }

      await this.ensureClientActive(customer.clientId);

      return this.generateTokens({
        id: customer.id,
        email: customer.email,
        role: Role.CUSTOMER,
        clientId: customer.clientId,
        subjectType: 'customer',
      });
    }
    throw new UnauthorizedException('Account not found');
  }

  async ResendOtp(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.usersRepo.findOne({
      where: { email: normalizedEmail },
      select: ['id', 'email', 'isActive', 'clientId', 'role'],
    });

    const customer = user
      ? null
      : await this.customersRepo.findOne({
          where: { email: normalizedEmail },
          select: ['id', 'email', 'status', 'clientId', 'deletedAt'],
        });

    if (!user && !customer) {
      throw new UnauthorizedException('Account not found');
    }

    if (user) {
      if (!user.isActive) {
        throw new UnauthorizedException('Account inactive');
      }

      if (user.role === 'client' || user.role === 'manager') {
        await this.ensureClientActive(user.clientId);
      }
    }

    if (customer) {
      if (!this.isCustomerActive(customer)) {
        throw new UnauthorizedException('Account inactive');
      }

      await this.ensureClientActive(customer.clientId);
    }

    const lastOtp = await this.otpRepo.findOne({
      where: { email: normalizedEmail },
      order: { createdAt: 'DESC' },
    });

    if (lastOtp) {
      const diff = (Date.now() - lastOtp.createdAt.getTime()) / 1000;

      if (diff < 60) {
        throw new BadRequestException(
          `Please wait ${Math.ceil(60 - diff)} seconds before requesting OTP again`,
        );
      }
    }

    const otp = this.generateOtp();
    await this.otpRepo.save({
      email: normalizedEmail,
      otp,
      isUsed: false,
    });

    await this.mailService.sendOtp(normalizedEmail, otp);

    return {
      message: 'OTP resent successfully',
    };
  }
}
