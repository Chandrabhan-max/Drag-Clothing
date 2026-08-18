import { HttpException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Cart } from 'src/entities';
import { Product } from 'src/entities';
import { Inventory } from 'src/entities';
import { ProductImage } from 'src/entities';
import { ProductVariant } from 'src/entities';
import { Discount } from 'src/entities';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiResponseService } from 'src/common/api-response.service';

@Injectable()
export class CartService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}

  async addToCart(userId: string, dto: AddToCartDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { productId, variantId, quantity } = dto;

      const product = await queryRunner.manager
        .createQueryBuilder(Product, 'product')
        .where('product.id = :productId', { productId })
        .getOne();

      if (!product) {
        throw {
          statusCode: 404,
          message: 'Product not found',
          errorType: 'Not Found',
        };
      }

      const existingItem = await queryRunner.manager
        .createQueryBuilder(Cart, 'cart')
        .where('cart.productId = :productId', { productId })
        .andWhere('cart.variantId = :variantId', { variantId })
        .andWhere('cart.userId = :userId', { userId })
        .getOne();

      if (existingItem) {
        existingItem.quantity += quantity;

        const updated = await queryRunner.manager.save(Cart, existingItem);

        await queryRunner.commitTransaction();

        return this.apiResponse.success(
          'Cart updated successfully',
          updated,
          200,
        );
      }

      const newItem = queryRunner.manager.create(Cart, {
        productId,
        variantId,
        userId,
        quantity,
      });

      const saved = await queryRunner.manager.save(Cart, newItem);

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Item added to cart successfully',
        saved,
        201,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Add to cart failed';
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

  async getCart(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cartItems = await queryRunner.manager
        .createQueryBuilder(Cart, 'cart')
        .where('cart.userId = :userId', { userId })
        .getMany();

      if (!cartItems.length) {
        await queryRunner.commitTransaction();

        return this.apiResponse.success(
          'Cart fetched successfully',
          {
            items: [],
            subtotal: 0,
            tax: 0,
            total: 0,
            itemCount: 0,
          },
          200,
        );
      }

      let subtotal = 0;
      const items: any[] = [];

      for (const item of cartItems) {
        const product = await queryRunner.manager
          .createQueryBuilder(Product, 'product')
          .where('product.id = :productId', { productId: item.productId })
          .getOne();

        if (!product) {
          continue;
        }

        const productImage = await queryRunner.manager
          .createQueryBuilder(ProductImage, 'image')
          .where('image.productId = :productId', { productId: product.id })
          .orderBy('image.createdAt', 'ASC')
          .getOne();
        const legacyVariantMappedImage =
          !productImage && item.variantId
            ? await queryRunner.manager
                .createQueryBuilder(ProductImage, 'image')
                .where('image.productId = :legacyId', {
                  legacyId: item.variantId,
                })
                .orderBy('image.createdAt', 'ASC')
                .getOne()
            : null;
        const resolvedImageUrl =
          productImage?.imageUrl ?? legacyVariantMappedImage?.imageUrl ?? null;

        const variant = item.variantId
          ? await queryRunner.manager
              .createQueryBuilder(ProductVariant, 'variant')
              .where('variant.id = :variantId', { variantId: item.variantId })
              .getOne()
          : null;

        const originalPrice = Number(variant?.price ?? product.price);

        // Get active flash sale
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

        const resolvedPrice =
          discountPercentage > 0
            ? Number(
                (
                  originalPrice -
                  (originalPrice * discountPercentage) / 100
                ).toFixed(2),
              )
            : originalPrice;

        const itemTotal = resolvedPrice * item.quantity;

        subtotal += itemTotal;

        items.push({
          cartId: item.id,
          productId: product.id,
          variantId: item.variantId,
          name: product.name,

          // Final payable price
          price: resolvedPrice,

          // Discount information
          originalPrice,
          discountPercentage,
          discountedPrice: resolvedPrice,
          hasFlashSale: discountPercentage > 0,

          imageUrl: resolvedImageUrl,
          size: variant?.size ?? null,
          quantity: item.quantity,
          total: itemTotal,

          product: {
            id: product.id,
            name: product.name,
            price: resolvedPrice,
            originalPrice,
            discountPercentage,
            discountedPrice: resolvedPrice,
            hasFlashSale: discountPercentage > 0,
            imageUrl: resolvedImageUrl,
            images: resolvedImageUrl ? [resolvedImageUrl] : [],
          },
          variant: variant
            ? {
                id: variant.id,
                size: variant.size,
                color: variant.color,
                price: Number(variant.price),
                stock: variant.stock,
              }
            : null,
        });
      }

      const tax = subtotal * 0.18;
      const total = subtotal + tax;

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Cart fetched successfully',
        {
          items,
          subtotal,
          tax,
          total,
          itemCount: items.length,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Fetching cart failed';
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

  async updateCart(id: string, dto: UpdateCartDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const item = await queryRunner.manager
        .createQueryBuilder(Cart, 'cart')
        .where('cart.id = :id', { id })
        .getOne();

      if (!item) {
        throw {
          statusCode: 404,
          message: 'Cart item not found',
          errorType: 'Not Found',
        };
      }

      item.quantity = dto.quantity;

      const updated = await queryRunner.manager.save(Cart, item);

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Cart item updated successfully',
        updated,
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Updating cart failed';
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

  async getCartCount(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const count = await queryRunner.manager
        .createQueryBuilder(Cart, 'cart')
        .where('cart.userId = :userId', { userId })
        .getCount();

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Cart count fetched successfully',
        { count },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      throw new HttpException(
        this.apiResponse.error(
          'Fetch cart count failed',
          422,
          'Unprocessable Request',
        ),
        422,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async validateCart(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

      const errors: any[] = [];

      for (const item of cartItems) {
        // 🔍 Check product
        const product = await queryRunner.manager
          .createQueryBuilder(Product, 'product')
          .where('product.id = :productId', { productId: item.productId })
          .getOne();

        if (!product) {
          errors.push({
            productId: item.productId,
            message: 'Product not found',
          });
          continue;
        }

        // 🔢 Check quantity
        if (item.quantity <= 0) {
          errors.push({
            productId: item.productId,
            message: 'Invalid quantity',
          });
        }

        // 📦 STOCK CHECK (if inventory table used)
        const inventory = await queryRunner.manager
          .createQueryBuilder(Inventory, 'inventory')
          .where('inventory.productId = :productId', {
            productId: item.productId,
          })
          .getOne();

        if (inventory && item.quantity > inventory.quantity) {
          errors.push({
            productId: item.productId,
            message: 'Insufficient stock',
            available: inventory.quantity,
          });
        }
      }

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Cart validation completed',
        {
          isValid: errors.length === 0,
          errors,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Cart validation failed';
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

  async removeItem(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const item = await queryRunner.manager
        .createQueryBuilder(Cart, 'cart')
        .where('cart.id = :id', { id })
        .getOne();

      if (!item) {
        throw {
          statusCode: 404,
          message: 'Cart item not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager.remove(Cart, item);

      await queryRunner.commitTransaction();

      return this.apiResponse.success('Item removed from cart', { id }, 200);
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Removing cart item failed';
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

  async clearCart(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Cart)
        .where('userId = :userId', { userId })
        .execute();

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Cart cleared successfully',
        { userId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Clearing cart failed';
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
