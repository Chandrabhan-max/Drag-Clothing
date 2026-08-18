import { HttpException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { ApiResponseService } from 'src/common/api-response.service';
import { Address } from 'src/entities';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}

  async addAddress(_user: any, dto: CreateAddressDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const address = await queryRunner.manager.save(Address, {
        ...dto,
        userId: _user.id,
      });

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Address added successfully',
        address,
        201,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw new HttpException(
        this.apiResponse.error(
          error?.message || 'Add address failed',
          error?.statusCode || 422,
          error?.errorType || 'Unprocessable Request',
        ),
        error?.statusCode || 422,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getMyAddresses(_user: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const addresses = await queryRunner.manager.find(Address, {
        where: { userId: _user.id },
        order: { createdAt: 'DESC' },
      });

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Addresses fetched successfully',
        {
          count: addresses.length,
          data: addresses,
        },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw new HttpException(
        this.apiResponse.error(
          error?.message || 'Fetch addresses failed',
          error?.statusCode || 422,
          error?.errorType || 'Unprocessable Request',
        ),
        error?.statusCode || 422,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAddress(_user: any, addressId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const address = await queryRunner.manager.findOne(Address, {
        where: {
          id: addressId,
          userId: _user.id,
        },
      });

      if (!address) {
        throw {
          statusCode: 404,
          message: 'Address not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager.remove(Address, address);
      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Address deleted successfully',
        null,
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw new HttpException(
        this.apiResponse.error(
          error?.message || 'Delete address failed',
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
