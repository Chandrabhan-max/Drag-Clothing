import { HttpException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Wishlist } from 'src/entities';
import { Product } from 'src/entities';
import { Cart } from 'src/entities';

import { ApiResponseService } from 'src/common/api-response.service';

@Injectable()
export class WishlistService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}

  // ✅ ADD TO WISHLIST
  async addToWishlist(userId: string, productId: string, variantId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager
        .createQueryBuilder(Wishlist, 'wishlist')
        .where('wishlist.userId = :userId', { userId })
        .andWhere('wishlist.productId = :productId', { productId })
        .andWhere('wishlist.variantId = :variantId', { variantId })
        .getOne();

      if (existing) {
        throw {
          statusCode: 400,
          message: 'Already in wishlist',
          errorType: 'Bad Request',
        };
      }

      const item = await queryRunner.manager.save(Wishlist, {
        userId,
        productId,
        variantId, // ✅ FIX
      });

      await queryRunner.commitTransaction();

      return this.apiResponse.success('Added to wishlist', item, 201);
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      throw new HttpException(
        this.apiResponse.error(
          error.message || 'Add failed',
          error.statusCode || 422,
          error.errorType || 'Unprocessable Request',
        ),
        error.statusCode || 422,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ GET WISHLIST
  async getWishlist(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const items = await queryRunner.manager
        .createQueryBuilder(Wishlist, 'wishlist')
        .leftJoinAndSelect(
          Product,
          'product',
          'product.id = wishlist.productId',
        )
        .where('wishlist.userId = :userId', { userId })
        .getMany();

      await queryRunner.commitTransaction();

      return this.apiResponse.success('Wishlist fetched', items, 200);
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

  // ✅ REMOVE ITEM
  async removeItem(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Wishlist)
        .where('id = :id', { id })
        .execute();

      await queryRunner.commitTransaction();

      return this.apiResponse.success('Item removed', { id }, 200);
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

  // ✅ MOVE TO CART
  async moveToCart(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const item = await queryRunner.manager
        .createQueryBuilder(Wishlist, 'wishlist')
        .where('wishlist.id = :id', { id })
        .getOne();

      if (!item) {
        throw {
          statusCode: 404,
          message: 'Item not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager.save(Cart, {
        userId: item.userId,
        productId: item.productId,
        variantId: item.variantId,
        quantity: 1,
      });

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Wishlist)
        .where('id = :id', { id })
        .execute();

      await queryRunner.commitTransaction();

      return this.apiResponse.success('Moved to cart', {}, 200);
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      throw new HttpException(
        this.apiResponse.error('Move failed', 422, 'Unprocessable Request'),
        422,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ COUNT
  async getWishlistCount(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const count = await queryRunner.manager
        .createQueryBuilder(Wishlist, 'wishlist')
        .where('wishlist.userId = :userId', { userId })
        .getCount();

      await queryRunner.commitTransaction();

      return this.apiResponse.success('Wishlist count fetched', { count }, 200);
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      throw new HttpException(
        this.apiResponse.error('Count failed', 422, 'Unprocessable Request'),
        422,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
