import { IsUUID, IsNumber, IsDateString, Min, Max } from 'class-validator';

export class CreateDiscountDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  percentage: number;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;
}
