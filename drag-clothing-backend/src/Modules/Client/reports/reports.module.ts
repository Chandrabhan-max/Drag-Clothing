import { Module, Global } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';

import { ReportsController } from './reports.controller';

import { ReportsService } from './reports.service';

import { ApiResponseService } from 'src/common/api-response.service';


@Global()
@Module({

  imports: [

    JwtModule.registerAsync({

      imports: [
        ConfigModule,
      ],

      inject: [
        ConfigService,
      ],

      useFactory: (
        config: ConfigService,
      ) => ({

        secret:
          config.get('JWT_SECRET'),

        signOptions: {
          expiresIn:
            config.get('JWT_EXPIRES_IN') || '1d',
        },

      }),

    }),

  ],


  controllers: [

    ReportsController,

  ],


  providers: [

    // EXISTING AUTH PROVIDER
    JwtGuard,

    // REPORTS PROVIDER
    ReportsService,

    // REQUIRED BY ReportsService
    ApiResponseService,

  ],


  exports: [

    JwtGuard,

    JwtModule,

    ReportsService,

  ],

})

export class CommonModule {}