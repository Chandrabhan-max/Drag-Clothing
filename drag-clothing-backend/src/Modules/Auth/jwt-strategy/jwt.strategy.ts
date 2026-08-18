import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, Customer, User } from 'src/entities';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Client)
    private clientsRepo: Repository<Client>,
    @InjectRepository(Customer)
    private customersRepo: Repository<Customer>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const subjectType =
      payload.subjectType === 'customer' ? 'customer' : 'user';
    if (subjectType === 'customer') {
      const customer = await this.customersRepo.findOne({
        where: { id: payload.id },
        select: ['id', 'email', 'status', 'clientId', 'deletedAt'],
      });

      if (!customer) {
        throw new UnauthorizedException('User not found');
      }

      if (customer.status !== 'ACTIVE' || customer.deletedAt) {
        throw new UnauthorizedException('Account inactive');
      }

      if (customer.clientId) {
        const client = await this.clientsRepo.findOne({
          where: { id: customer.clientId },
          select: ['id', 'isActive'],
        });

        if (!client || !client.isActive) {
          throw new UnauthorizedException('Client inactive');
        }
      }

      return {
        id: customer.id,
        email: customer.email,
        role: Role.CUSTOMER,
        clientId: customer.clientId,
        subjectType: 'customer',
      };
    }

    const user = await this.usersRepo.findOne({
      where: { id: payload.id },
      select: ['id', 'email', 'role', 'clientId', 'isActive'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account inactive');
    }

    if (user.clientId) {
      const client = await this.clientsRepo.findOne({
        where: { id: user.clientId },
        select: ['id', 'isActive'],
      });

      if (!client || !client.isActive) {
        throw new UnauthorizedException('Client inactive');
      }
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
      subjectType: 'user',
    };
  }
}
