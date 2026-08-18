import { IsUUID } from 'class-validator';

export class CreateGatewayOrderDto {

  @IsUUID()
  orderId: string;

}