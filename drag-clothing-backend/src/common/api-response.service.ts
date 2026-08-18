import { Injectable, HttpStatus, HttpException } from '@nestjs/common';

@Injectable()
export class ApiResponseService {
  success(
    message: string,
    data: any = null,
    statusCode: number = HttpStatus.OK,
  ) {
    return {
      status: true,
      message,
      error: null,
      data,
      statusCode,
    };
  }

  error(
    message: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
    errorType: string = 'Bad Request',
    data: any = null,
  ) {
    return {
      status: false,
      message,
      error: errorType,
      data,
      statusCode,
    };
  }

  throwError(
    message: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
    errorType: string = 'Bad Request',
    data: any = null,
  ) {
    throw new HttpException(
      {
        status: false,
        message,
        error: errorType,
        data,
        statusCode,
      },
      statusCode,
    );
  }
}
