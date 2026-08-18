import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client, Customer, User } from 'src/entities';
import { JwtStrategy } from './jwt-strategy/jwt.strategy';
import { RefreshStrategy } from './jwt-strategy/refresh.strategy';
import { JwtModule } from '@nestjs/jwt';
import { Otp } from 'src/entities';
import { MailService } from './mail.service';
import { AuditModule } from '../Audit-log/audit-log.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Client, Customer, Otp]),
    JwtModule.register({}),
    AuditModule,
  ],
  providers: [AuthService, JwtStrategy, RefreshStrategy, MailService],
  controllers: [AuthController],
})
export class AuthModule {}
