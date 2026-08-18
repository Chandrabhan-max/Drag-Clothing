import { HttpException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Address } from '../../entities/address.entity';
import { ApiResponseService } from 'src/common/api-response.service';
import { Cart, Customer, Order, Product, Wishlist } from 'src/entities';

@Injectable()
export class CustomersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}

  // ✅ ADD ADDRESS
  async addAddress(body: any) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const address = await queryRunner.manager.save(Address, {
        userId: body.userId,
        fullName: body.fullName,
        phone: body.phone,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        city: body.city,
        state: body.state,
        postalCode: body.postalCode,
        country: body.country,
      });

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Address added successfully',
        address,
        201,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Add address failed';
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

  // ✅ DASHBOARD
  async getDashboard(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // total orders
      const totalOrders = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .where('order.userId = :userId', { userId })
        .getCount();

      // total cart items
      const cartCount = await queryRunner.manager
        .createQueryBuilder(Cart, 'cart')
        .where('cart.userId = :userId', { userId })
        .getCount();

      // wishlist count
      const wishlistCount = await queryRunner.manager
        .createQueryBuilder(Wishlist, 'wishlist')
        .where('wishlist.userId = :userId', { userId })
        .getCount();

      // recent orders
      const recentOrders = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .where('order.userId = :userId', { userId })
        .orderBy('order.createdAt', 'DESC')
        .limit(5)
        .getMany();

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Dashboard fetched successfully',
        {
          totalOrders,
          cartCount,
          wishlistCount,
          recentOrders,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      throw new HttpException(
        this.apiResponse.error(
          error.message || 'Dashboard failed',
          error.statusCode || 422,
          error.errorType || 'Unprocessable Request',
        ),
        error.statusCode || 422,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ NOTIFICATIONS
  async getNotifications(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orders = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .where('order.userId = :userId', { userId })
        .orderBy('order.createdAt', 'DESC')
        .limit(10)
        .getMany();

      const notifications = orders.map((order) => ({
        id: order.id,
        message: `Your order ${order.id} is ${order.status}`,
        createdAt: order.createdAt,
      }));

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Notifications fetched successfully',
        notifications,
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      throw new HttpException(
        this.apiResponse.error(
          'Fetch notifications failed',
          422,
          'Unprocessable Request',
        ),
        422,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async previewOrder(userId: string, couponCode?: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 🛒 CART ITEMS
      const cartItems = await queryRunner.manager
        .createQueryBuilder(Cart, 'cart')
        .where('cart.userId = :userId', { userId })
        .getMany();

      if (!cartItems.length) {
        throw {
          statusCode: 404,
          message: 'Cart is empty',
          errorType: 'Not Found',
        };
      }

      let subtotal = 0;
      const items: any[] = [];

      for (const item of cartItems) {
        const product = await queryRunner.manager
          .createQueryBuilder(Product, 'product')
          .where('product.id = :id', { id: item.productId })
          .getOne();

        if (!product) continue;

        const itemTotal = Number(product.price) * item.quantity;

        subtotal += itemTotal;

        items.push({
          productId: product.id,
          name: product.name,
          quantity: item.quantity,
          price: Number(product.price),
          total: itemTotal,
        });
      }

      // 🎟️ COUPON LOGIC (PRO LEVEL)
      let discount = 0;
      let appliedCoupon: any = null;

      if (couponCode) {
        const coupon = await queryRunner.manager
          .createQueryBuilder('discounts', 'd')
          .where('d.code = :code', { code: couponCode })
          .andWhere('d.is_active = :active', { active: 1 })
          .getRawOne();

        if (!coupon) {
          throw {
            statusCode: 404,
            message: 'Invalid coupon',
            errorType: 'Not Found',
          };
        }

        // ⏳ expiry check
        if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
          throw {
            statusCode: 400,
            message: 'Coupon expired',
            errorType: 'Bad Request',
          };
        }

        // 💰 min order check
        if (
          coupon.min_order_value &&
          subtotal < Number(coupon.min_order_value)
        ) {
          throw {
            statusCode: 400,
            message: `Minimum order should be ${coupon.min_order_value}`,
            errorType: 'Bad Request',
          };
        }

        // 🧮 discount type
        if (coupon.type === 'PERCENTAGE') {
          discount = (subtotal * Number(coupon.value)) / 100;

          // optional max cap
          if (coupon.max_discount) {
            discount = Math.min(discount, Number(coupon.max_discount));
          }
        } else {
          // FLAT
          discount = Number(coupon.value);
        }

        appliedCoupon = {
          code: coupon.code,
          discount,
        };
      }

      // 🧾 TAX + DELIVERY
      const tax = subtotal * 0.1; // 10%
      const delivery = subtotal > 1000 ? 0 : 50;

      const total = subtotal + tax + delivery - discount;

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Order preview calculated',
        {
          items,
          subtotal,
          tax,
          delivery,
          discount,
          total,
          coupon: appliedCoupon,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Preview failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      }

      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getAddress(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const addresses = await queryRunner.manager
        .createQueryBuilder(Address, 'address')
        .where('address.userId = :userId', { userId })
        .getMany();

      await queryRunner.commitTransaction();

      return this.apiResponse.success('Addresses fetched', addresses, 200);
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      throw new HttpException(
        this.apiResponse.error('Fetch failed', 422, 'Unprocessable Request'),
        422,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ UPDATE ADDRESS
  async updateAddress(id: string, body: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(Address)
        .set({
          fullName: body.fullName,
          phone: body.phone,
          addressLine1: body.addressLine1,
          addressLine2: body.addressLine2,
          city: body.city,
          state: body.state,
          postalCode: body.postalCode,
          country: body.country,
        })
        .where('id = :id', { id })
        .execute();

      await queryRunner.commitTransaction();

      return this.apiResponse.success('Address updated', { id }, 200);
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      throw new HttpException(
        this.apiResponse.error('Update failed', 422, 'Unprocessable Request'),
        422,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ DELETE ADDRESS
  async deleteAddress(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Address)
        .where('id = :id', { id })
        .execute();

      await queryRunner.commitTransaction();

      return this.apiResponse.success('Address deleted', { id }, 200);
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      throw new HttpException(
        this.apiResponse.error('Delete failed', 422, 'Unprocessable Request'),
        422,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ GET PROFILE
  async getProfile(customerId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customer = await queryRunner.manager
        .createQueryBuilder(Customer, 'customer')
        .where('customer.id = :customerId', { customerId })
        .getOne();

      if (!customer) {
        throw {
          statusCode: 404,
          message: 'Customer not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.commitTransaction();

      return this.apiResponse.success('Profile fetched', customer, 200);
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      throw new HttpException(
        this.apiResponse.error(
          error.message || 'Fetch failed',
          error.statusCode || 422,
          error.errorType || 'Unprocessable Request',
        ),
        error.statusCode || 422,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ UPDATE PROFILE
  async updateProfile(customerId: string, body: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customer = await queryRunner.manager
        .createQueryBuilder(Customer, 'customer')
        .where('customer.id = :customerId', { customerId })
        .getOne();

      if (!customer) {
        throw {
          statusCode: 404,
          message: 'Customer not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Customer)
        .set({
          name: body.name,
          phone: body.phone,
        })
        .where('id = :customerId', { customerId })
        .execute();

      await queryRunner.commitTransaction();

      return this.apiResponse.success('Profile updated', { customerId }, 200);
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      throw new HttpException(
        this.apiResponse.error('Update failed', 422, 'Unprocessable Request'),
        422,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
