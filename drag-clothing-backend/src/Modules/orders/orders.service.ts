import { HttpException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Order } from 'src/entities';
import { OrderItem } from 'src/entities';
import { Cart } from 'src/entities';

import {
  Product,
  ProductVariant,
  User,
  Address,
  ProductImage,
  Customer,
} from 'src/entities';

import { ApiResponseService } from 'src/common/api-response.service';
import { AuditService } from 'src/Modules/Audit-log/audit-log.service';
import { Discount } from 'src/entities';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
    private readonly auditService: AuditService,
  ) {}

  async createOrder(_user: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    const userId = _user.id;

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

      let total = 0;
      let clientId: string | null = null;

      const orderItems: Array<{
        productId: string;
        variantId: string;
        quantity: number;
        price: number;
      }> = [];

      for (const item of cartItems) {
        const product = await queryRunner.manager
          .createQueryBuilder(Product, 'product')
          .where('product.id = :productId', {
            productId: item.productId,
          })
          .getOne();

        if (!product) {
          continue;
        }

        if (!clientId) {
          clientId = product.clientId;
        }

        if (!item.variantId) {
          throw {
            statusCode: 400,
            message: `Variant is required for product ${product.id}`,
            errorType: 'Bad Request',
          };
        }

        const variant = await queryRunner.manager
          .createQueryBuilder(ProductVariant, 'variant')
          .where('variant.id = :variantId', {
            variantId: item.variantId,
          })
          .getOne();

        if (!variant) {
          throw {
            statusCode: 404,
            message: `Variant not found for product ${product.id}`,
            errorType: 'Not Found',
          };
        }

        if (Number(variant.stock) < Number(item.quantity)) {
          throw {
            statusCode: 400,
            message: `Insufficient stock for ${product.name}`,
            errorType: 'Bad Request',
          };
        }

        const stockUpdate = await queryRunner.manager
          .createQueryBuilder()
          .update(ProductVariant)
          .set({
            stock: () => `stock - ${Number(item.quantity)}`,
          })
          .where('id = :variantId', {
            variantId: item.variantId,
          })
          .andWhere('stock >= :quantity', {
            quantity: Number(item.quantity),
          })
          .execute();

        if (!stockUpdate.affected) {
          throw {
            statusCode: 400,
            message: `Insufficient stock for ${product.name}`,
            errorType: 'Bad Request',
          };
        }

        const originalPrice = Number(variant?.price ?? product.price);

        const discount = await queryRunner.manager
          .createQueryBuilder(Discount, 'discount')
          .where('discount.productId = :productId', {
            productId: product.id,
          })
          .andWhere('discount.isActive = :isActive', {
            isActive: true,
          })
          .andWhere('discount.startDate <= CURRENT_TIMESTAMP')
          .andWhere('discount.endDate >= CURRENT_TIMESTAMP')
          .orderBy('discount.percentage', 'DESC')
          .getOne();

        const discountPercentage = Number(discount?.percentage || 0);

        const finalPrice =
          discountPercentage > 0
            ? Number(
                (
                  originalPrice -
                  (originalPrice * discountPercentage) / 100
                ).toFixed(2),
              )
            : originalPrice;

        const itemTotal = finalPrice * item.quantity;

        total += itemTotal;

        orderItems.push({
          productId: product.id,
          variantId: item.variantId,
          quantity: item.quantity,
          price: finalPrice,
        });
      }

      if (!orderItems.length) {
        throw {
          statusCode: 404,
          message: 'No valid products found in cart',
          errorType: 'Not Found',
        };
      }

      if (!clientId) {
        throw {
          statusCode: 400,
          message: 'Unable to determine client for order',
          errorType: 'Bad Request',
        };
      }

      const defaultAddress = await queryRunner.manager
        .createQueryBuilder('addresses', 'a')
        .select('a.id', 'id')
        .where('a.user_id = :userId', { userId })
        .orderBy('a.created_at', 'DESC')
        .getRawOne<{ id: string }>();

      if (!defaultAddress?.id) {
        throw {
          statusCode: 400,
          message: 'Address is required to place an order',
          errorType: 'Bad Request',
        };
      }

      const order = await queryRunner.manager.save(Order, {
        userId,
        clientId,
        addressId: defaultAddress.id,
        managerId: null,
        totalAmount: total,
        status: 'pending',
      });

      for (const item of orderItems) {
        await queryRunner.manager.save(OrderItem, {
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        });
      }

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'CREATE',
          entity: 'ORDER',
          entityId: order.id,
          clientId: order.clientId,
          newValue: {
            userId: order.userId,
            clientId: order.clientId,
            addressId: order.addressId,
            totalAmount: order.totalAmount,
            status: order.status,
            itemCount: orderItems.length,
          },
        },
      );

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Cart)
        .where('userId = :userId', { userId })
        .execute();

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Order created successfully',
        {
          orderId: order.id,
          totalAmount: total,
        },
        201,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      let statusCode = 422;
      let message = 'Create order failed';
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

  async getOrderById(orderId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .where('order.id = :orderId', { orderId })
        .getOne();

      if (!order) {
        throw {
          statusCode: 404,
          message: 'Order not found',
          errorType: 'Not Found',
        };
      }

      // CUSTOMER
      const customer = await queryRunner.manager
        .createQueryBuilder(Customer, 'customer')
        .select([
          'customer.id',
          'customer.name',
          'customer.email',
          'customer.phone',
        ])
        .where('customer.id = :customerId', {
          customerId: order.userId,
        })
        .getOne();

      // CLIENT
      const client = order.clientId
        ? await queryRunner.manager
            .createQueryBuilder(User, 'user')
            .select(['user.id', 'user.name', 'user.email', 'user.phone'])
            .where('user.id = :clientId', {
              clientId: order.clientId,
            })
            .getOne()
        : null;

      // SHIPPING ADDRESS
      const address = order.addressId
        ? await queryRunner.manager
            .createQueryBuilder(Address, 'address')
            .where('address.id = :addressId', {
              addressId: order.addressId,
            })
            .getOne()
        : null;

      // ORDER ITEMS
      const items = await queryRunner.manager
        .createQueryBuilder(OrderItem, 'item')
        .where('item.orderId = :orderId', {
          orderId,
        })
        .getMany();

      // PRODUCT + VARIANT + IMAGE
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const variant = item.variantId
            ? await queryRunner.manager
                .createQueryBuilder(ProductVariant, 'variant')
                .select([
                  'variant.id',
                  'variant.productId',
                  'variant.size',
                  'variant.color',
                  'variant.price',
                ])
                .where('variant.id = :variantId', {
                  variantId: item.variantId,
                })
                .getOne()
            : null;

          const productId = variant?.productId || item.productId;

          const product = await queryRunner.manager
            .createQueryBuilder(Product, 'product')
            .select([
              'product.id',
              'product.name',
              'product.description',
              'product.price',
            ])
            .where('product.id = :productId', { productId })
            .getOne();

          const imageRows = await queryRunner.manager
            .createQueryBuilder(ProductImage, 'image')
            .where('image.productId = :productId', { productId })
            .orderBy('image.createdAt', 'ASC')
            .getMany();

          const images = imageRows
            .map((image) => image.imageUrl)
            .filter(Boolean);

          return {
            id: item.id,
            orderId: item.orderId,

            productId: product?.id || item.productId,

            productName: product?.name || null,

            product: product
              ? {
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  price: Number(product.price),
                  images,
                  imageUrl: images[0] || null,
                }
              : null,

            variantId: item.variantId,

            variant: variant
              ? {
                  id: variant.id,
                  size: variant.size,
                  color: variant.color,
                  price: Number(variant.price),
                }
              : null,

            quantity: Number(item.quantity),

            price: Number(item.price),

            total: Number(item.price) * Number(item.quantity),
          };
        }),
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Order fetched successfully',
        {
          ...order,

          customer: customer
            ? {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
              }
            : null,

          client: client
            ? {
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone,
              }
            : null,

          shippingAddress: address
            ? {
                id: address.id,
                fullName: address.fullName,
                phone: address.phone,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country,
              }
            : null,

          items: enrichedItems,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      let statusCode = 422;
      let message = 'Fetch order failed';
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

  async getOrders(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orders = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .where('order.userId = :userId', { userId })
        .orderBy('order.createdAt', 'DESC')
        .getMany();

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Orders fetched successfully',
        {
          total: orders.length,
          data: orders,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      let statusCode = 422;
      let message = 'Fetch orders failed';
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

  async previewOrder(userId: string, couponCode: string | undefined) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!userId) {
        throw {
          statusCode: 400,
          message: 'userId is required',
          errorType: 'Bad Request',
        };
      }

      const cartItems = await queryRunner.manager
        .createQueryBuilder(Cart, 'cart')
        .where('cart.userId = :userId', { userId })
        .getMany();

      if (!cartItems.length) {
        throw {
          statusCode: 400,
          message: 'Cart is empty',
          errorType: 'Bad Request',
        };
      }

      let subtotal = 0;
      const items: any[] = [];

      for (const item of cartItems) {
        const product = await queryRunner.manager
          .createQueryBuilder(Product, 'product')
          .where('product.id = :productId', {
            productId: item.productId,
          })
          .getOne();

        if (!product) continue;

        const originalPrice = Number(product.price);

        const discount = await queryRunner.manager
          .createQueryBuilder(Discount, 'discount')
          .where('discount.productId = :productId', {
            productId: product.id,
          })
          .andWhere('discount.isActive = :isActive', {
            isActive: true,
          })
          .andWhere('discount.startDate <= CURRENT_TIMESTAMP')
          .andWhere('discount.endDate >= CURRENT_TIMESTAMP')
          .orderBy('discount.percentage', 'DESC')
          .getOne();

        const discountPercentage = Number(discount?.percentage || 0);

        const price =
          discountPercentage > 0
            ? Number(
                (
                  originalPrice -
                  (originalPrice * discountPercentage) / 100
                ).toFixed(2),
              )
            : originalPrice;

        const itemTotal = price * item.quantity;

        subtotal += itemTotal;

        items.push({
          productId: product.id,
          name: product.name,
          quantity: item.quantity,

          price,
          originalPrice,
          discountPercentage,
          discountedPrice: price,
          hasFlashSale: discountPercentage > 0,

          total: itemTotal,
        });
      }

      const tax = subtotal * 0.1;
      const delivery = 50;
      const total = subtotal + tax + delivery;

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Order preview calculated',
        {
          items,
          subtotal,
          tax,
          delivery,
          total,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      let statusCode = 422;
      let message = 'Order preview failed';
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

  async cancelOrder(_user: any, orderId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .where('order.id = :orderId', { orderId })
        .getOne();

      if (!order) {
        throw {
          statusCode: 404,
          message: 'Order not found',
          errorType: 'Not Found',
        };
      }

      if (order.status !== 'pending') {
        throw {
          statusCode: 400,
          message: `Order cannot be cancelled. Current status: ${order.status}`,
          errorType: 'Bad Request',
        };
      }

      const orderItems = await queryRunner.manager
        .createQueryBuilder(OrderItem, 'item')
        .where('item.orderId = :orderId', { orderId })
        .getMany();

      for (const item of orderItems) {
        if (!item.variantId || !item.quantity) {
          continue;
        }

        await queryRunner.manager
          .createQueryBuilder()
          .update(ProductVariant)
          .set({
            stock: () => `stock + ${Number(item.quantity)}`,
          })
          .where('id = :variantId', {
            variantId: item.variantId,
          })
          .execute();
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Order)
        .set({ status: 'cancelled' })
        .where('id = :orderId', { orderId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'CANCEL',
          entity: 'ORDER',
          entityId: order.id,
          clientId: order.clientId,
          oldValue: {
            status: order.status,
          },
          newValue: {
            status: 'cancelled',
          },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Order cancelled successfully',
        { orderId, status: 'cancelled' },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      let statusCode = 422;
      let message = 'Cancel order failed';
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

  async updateOrderStatus(
    _user: any,
    orderId: string,
    status: string,
    trackingNumber?: string,
    courierName?: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .where('order.id = :orderId', { orderId })
        .getOne();

      if (!order) {
        throw {
          statusCode: 404,
          message: 'Order not found',
          errorType: 'Not Found',
        };
      }

      if (_user.role === 'customer') {
        throw {
          statusCode: 403,
          message: 'Customers are not allowed to update order status',
          errorType: 'Forbidden',
        };
      }

      if (_user.role === 'manager') {
        if (order.clientId !== _user.clientId) {
          throw {
            statusCode: 403,
            message: 'You cannot update orders outside your client',
            errorType: 'Forbidden',
          };
        }
      }

      if (_user.role === 'client') {
        if (order.clientId !== _user.clientId) {
          throw {
            statusCode: 403,
            message: 'You cannot update orders outside your client',
            errorType: 'Forbidden',
          };
        }
      }

      const updateData: any = { status };

      if (status === 'shipped') {
        updateData.shippedAt = new Date();

        if (trackingNumber) {
          updateData.trackingNumber = trackingNumber;
        }

        if (courierName) {
          updateData.courierName = courierName;
        }
      }

      if (status === 'delivered') {
        updateData.deliveredAt = new Date();
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Order)
        .set(updateData)
        .where('id = :orderId', { orderId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'UPDATE_STATUS',
          entity: 'ORDER',
          entityId: order.id,
          clientId: order.clientId,
          oldValue: {
            status: order.status,
            trackingNumber: order.trackingNumber,
            courierName: order.courierName,
          },
          newValue: {
            status,
            trackingNumber:
              updateData.trackingNumber ?? order.trackingNumber ?? null,
            courierName: updateData.courierName ?? order.courierName ?? null,
          },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Order status updated successfully',
        {
          orderId,
          from: order.status,
          to: status,
          trackingNumber: updateData.trackingNumber ?? null,
          courierName: updateData.courierName ?? null,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      let statusCode = 422;
      let message = 'Update status failed';
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

  async getClientOrders(clientId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orders = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .where('order.clientId = :clientId', { clientId })
        .orderBy('order.createdAt', 'DESC')
        .getMany();

      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          // CUSTOMER
          const customer = await queryRunner.manager
            .createQueryBuilder(Customer, 'customer')
            .select([
              'customer.id',
              'customer.name',
              'customer.email',
              'customer.phone',
            ])
            .where('customer.id = :customerId', {
              customerId: order.userId,
            })
            .getOne();

          // ADDRESS
          const address = order.addressId
            ? await queryRunner.manager
                .createQueryBuilder(Address, 'address')
                .where('address.id = :addressId', {
                  addressId: order.addressId,
                })
                .getOne()
            : null;

          // ITEMS
          const items = await queryRunner.manager
            .createQueryBuilder(OrderItem, 'item')
            .where('item.orderId = :orderId', {
              orderId: order.id,
            })
            .getMany();

          const enrichedItems = await Promise.all(
            items.map(async (item) => {
              // PRODUCT
              const product = await queryRunner.manager
                .createQueryBuilder(Product, 'product')
                .where('product.id = :productId', {
                  productId: item.productId,
                })
                .getOne();

              // VARIANT
              const variant = item.variantId
                ? await queryRunner.manager
                    .createQueryBuilder(ProductVariant, 'variant')
                    .where('variant.id = :variantId', {
                      variantId: item.variantId,
                    })
                    .getOne()
                : null;

              // IMAGES
              const imageRows = await queryRunner.manager
                .createQueryBuilder(ProductImage, 'image')
                .where('image.productId = :productId', {
                  productId: item.productId,
                })
                .orderBy('image.createdAt', 'ASC')
                .getMany();

              const images = imageRows
                .map((image) => image.imageUrl)
                .filter(Boolean);

              return {
                ...item,

                product: product
                  ? {
                      id: product.id,
                      name: product.name,
                      price: Number(product.price),
                      images,
                      imageUrl: images[0] || null,
                    }
                  : null,

                variant: variant
                  ? {
                      id: variant.id,
                      size: variant.size,
                      color: variant.color,
                      price: Number(variant.price),
                    }
                  : null,

                total: Number(item.price) * Number(item.quantity),
              };
            }),
          );

          return {
            ...order,

            customer: customer
              ? {
                  id: customer.id,
                  name: customer.name,
                  email: customer.email,
                  phone: customer.phone,
                }
              : null,

            shippingAddress: address
              ? {
                  id: address.id,
                  fullName: address.fullName,
                  phone: address.phone,
                  addressLine1: address.addressLine1,
                  addressLine2: address.addressLine2,
                  city: address.city,
                  state: address.state,
                  postalCode: address.postalCode,
                  country: address.country,
                }
              : null,

            items: enrichedItems,
          };
        }),
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Client orders fetched successfully',
        {
          total: enrichedOrders.length,
          data: enrichedOrders,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw new HttpException(
        this.apiResponse.error(
          error?.message || 'Fetch client orders failed',
          error?.statusCode || 422,
          error?.errorType || 'Unprocessable Request',
        ),
        error?.statusCode || 422,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getManagerOrders(managerId: string, clientId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orders = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .where('order.managerId = :managerId', { managerId })
        .orWhere('order.managerId IS NULL AND order.clientId = :clientId', {
          clientId,
        })
        .orderBy('order.createdAt', 'DESC')
        .getMany();

      // =====================================================
      // ENRICH ORDERS WITH CUSTOMER
      // =====================================================

      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          // =====================================================
          // CUSTOMER
          // =====================================================

          const customer = await queryRunner.manager
            .createQueryBuilder(Customer, 'customer')
            .select([
              'customer.id',
              'customer.name',
              'customer.email',
              'customer.phone',
            ])
            .where('customer.id = :customerId', {
              customerId: order.userId,
            })
            .getOne();

          // =====================================================
          // ADDRESS
          // =====================================================

          const address = order.addressId
            ? await queryRunner.manager
                .createQueryBuilder(Address, 'address')
                .where('address.id = :addressId', {
                  addressId: order.addressId,
                })
                .getOne()
            : null;

          // =====================================================
          // ORDER ITEMS
          // =====================================================

          const items = await queryRunner.manager
            .createQueryBuilder(OrderItem, 'item')
            .where('item.orderId = :orderId', {
              orderId: order.id,
            })
            .getMany();

          // =====================================================
          // ENRICH ITEMS
          // =====================================================

          const enrichedItems = await Promise.all(
            items.map(async (item) => {
              const product = await queryRunner.manager
                .createQueryBuilder(Product, 'product')
                .where('product.id = :productId', {
                  productId: item.productId,
                })
                .getOne();

              const variant = item.variantId
                ? await queryRunner.manager
                    .createQueryBuilder(ProductVariant, 'variant')
                    .where('variant.id = :variantId', {
                      variantId: item.variantId,
                    })
                    .getOne()
                : null;

              const imageRows = await queryRunner.manager
                .createQueryBuilder(ProductImage, 'image')
                .where('image.productId = :productId', {
                  productId: item.productId,
                })
                .orderBy('image.createdAt', 'ASC')
                .getMany();

              const images = imageRows
                .map((image) => image.imageUrl)
                .filter(Boolean);

              return {
                ...item,

                product: product
                  ? {
                      id: product.id,
                      name: product.name,
                      price: Number(product.price),
                      images,
                      imageUrl: images[0] || null,
                    }
                  : null,

                variant: variant
                  ? {
                      id: variant.id,
                      size: variant.size,
                      color: variant.color,
                      price: Number(variant.price),
                    }
                  : null,

                total: Number(item.price) * Number(item.quantity),
              };
            }),
          );

          return {
            ...order,

            customer: customer
              ? {
                  id: customer.id,
                  name: customer.name,
                  email: customer.email,
                  phone: customer.phone,
                }
              : null,

            shippingAddress: address
              ? {
                  id: address.id,
                  fullName: address.fullName,
                  phone: address.phone,
                  addressLine1: address.addressLine1,
                  addressLine2: address.addressLine2,
                  city: address.city,
                  state: address.state,
                  postalCode: address.postalCode,
                  country: address.country,
                }
              : null,

            items: enrichedItems,
          };
        }),
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Manager orders fetched successfully',
        {
          total: enrichedOrders.length,
          data: enrichedOrders,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw new HttpException(
        this.apiResponse.error(
          error?.message || 'Fetch manager orders failed',
          error?.statusCode || 422,
          error?.errorType || 'Unprocessable Request',
        ),
        error?.statusCode || 422,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
