import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponseService } from 'src/common/api-response.service';
import * as Entity from 'src/entities';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}

  async createReview(_user: any, productId: string, dto: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const review = queryRunner.manager.create(Entity.Review, {
        id: uuidv4(),
        userId: _user.id,
        productId,
        rating: dto.rating,
        comment: dto.comment,
      });

      await queryRunner.manager.save(Entity.Review, review);
      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Review submitted successfully',
        review,
        201,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      this.handleError(error, 'Submit review failed');
    } finally {
      await queryRunner.release();
    }
  }

  async getProductReviews(productId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const reviews = await queryRunner.manager
        .createQueryBuilder(Entity.Review, 'review')
        .where('review.productId = :productId', { productId })
        .orderBy('review.createdAt', 'DESC')
        .getMany();
      return this.apiResponse.success(
        'Reviews fetched successfully',
        reviews,
        200,
      );
    } catch (error: any) {
      this.handleError(error, 'Fetch reviews failed');
    } finally {
      await queryRunner.release();
    }
  }

  async deleteReview(_user: any, id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(Entity.Review, {
        where: { id },
      });
      if (!existing)
        throw {
          statusCode: 404,
          message: 'Review not found',
          errorType: 'Not Found',
        };

      // Optional: Add logic to ensure only the review author or admin can delete
      // if (existing.userId !== _user.id && _user.role !== 'SUPER_ADMIN') throw Unauthorized

      await queryRunner.manager.delete(Entity.Review, { id });
      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Review deleted successfully',
        { id },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      this.handleError(error, 'Delete review failed');
    } finally {
      await queryRunner.release();
    }
  }

  private handleError(error: any, defaultMessage: string) {
    const statusCode = error?.statusCode || 422;
    const message = error?.message || defaultMessage;
    const errorType = error?.errorType || 'Unprocessable Request';
    throw new HttpException(
      this.apiResponse.error(message, statusCode, errorType),
      statusCode,
    );
  }
}
