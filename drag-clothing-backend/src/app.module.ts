import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthModule } from './Modules/Auth/auth.module';
import * as Entities from './entities';
import { AdminModule } from './Modules/Admin/admin.module';
import { ClientModule } from './Modules/Client/client.module';
import { ManagerModule } from './Modules/Manager/manager.module';
import { ManagerReportsModule } from './Modules/Manager/reports/reports.module';
import { CategoriesModule } from './Modules/categories/categories.module';
import { ReviewsModule } from './Modules/reviews/reviews.module';
import { MediaModule } from './Modules/media/media.module';
import { WishlistModule } from './Modules/wishlist/wishlist.module';
import { OrdersModule } from './Modules/orders/orders.module';
import { AddressModule } from './Modules/Address/address.module';
import { ProductsModule } from './Modules/products/products.module';
import { CartModule } from './Modules/cart/cart.module';
import { CustomersModule } from './Modules/customers/customers.module';
import { PaymentsModule } from './Modules/payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),

        entities: Object.values(Entities),

        synchronize: false,
      }),
    }),

    AuthModule,
    AdminModule,
    ClientModule,
    ManagerModule,
    ManagerReportsModule,
    CategoriesModule,
    ReviewsModule,
    MediaModule,
    WishlistModule,
    OrdersModule,
    AddressModule,
    ProductsModule,
    CartModule,
    CustomersModule,
    PaymentsModule,
    ClientModule
  ],
})
export class AppModule {}
