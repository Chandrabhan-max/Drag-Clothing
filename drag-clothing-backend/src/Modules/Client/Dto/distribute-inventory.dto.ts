import { IsUUID, IsInt, Min } from 'class-validator';

export class DistributeInventoryDto {
  @IsUUID()
  managerId: string;

  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
