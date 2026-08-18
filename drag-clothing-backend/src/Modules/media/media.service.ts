import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponseService } from 'src/common/api-response.service';
import * as Entity from 'src/entities';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}

  async createProductImage(_user: any, productId: string, dto: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const image = queryRunner.manager.create(Entity.ProductImage, {
        id: uuidv4(),
        productId,
        imageUrl: dto.imageUrl,
      });

      await queryRunner.manager.save(Entity.ProductImage, image);
      await queryRunner.commitTransaction();

      return this.apiResponse.success('Image added successfully', image, 201);
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      this.handleError(error, 'Add image failed');
    } finally {
      await queryRunner.release();
    }
  }

  async getProductImages(_user: any, productId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const images = await queryRunner.manager
        .createQueryBuilder(Entity.ProductImage, 'image')
        .where('image.productId = :productId', { productId })
        .getMany();
      return this.apiResponse.success(
        'Images fetched successfully',
        images,
        200,
      );
    } catch (error: any) {
      this.handleError(error, 'Fetch images failed');
    } finally {
      await queryRunner.release();
    }
  }

  async getImageById(_user: any, id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const image = await queryRunner.manager.findOne(Entity.ProductImage, {
        where: { id },
      });
      if (!image)
        throw {
          statusCode: 404,
          message: 'Image not found',
          errorType: 'Not Found',
        };
      return this.apiResponse.success('Image fetched successfully', image, 200);
    } catch (error: any) {
      this.handleError(error, 'Fetch image failed');
    } finally {
      await queryRunner.release();
    }
  }

  async updateImage(_user: any, id: string, dto: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(Entity.ProductImage, {
        where: { id },
      });
      if (!existing)
        throw {
          statusCode: 404,
          message: 'Image not found',
          errorType: 'Not Found',
        };

      await queryRunner.manager.update(
        Entity.ProductImage,
        { id },
        { imageUrl: dto.imageUrl },
      );
      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Image updated successfully',
        { id },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      this.handleError(error, 'Update image failed');
    } finally {
      await queryRunner.release();
    }
  }

  async deleteImage(_user: any, id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(Entity.ProductImage, {
        where: { id },
      });
      if (!existing)
        throw {
          statusCode: 404,
          message: 'Image not found',
          errorType: 'Not Found',
        };

      await queryRunner.manager.delete(Entity.ProductImage, { id });
      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Image deleted successfully',
        { id },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      this.handleError(error, 'Delete image failed');
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
