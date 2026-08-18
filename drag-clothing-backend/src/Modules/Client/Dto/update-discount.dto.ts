import { IsOptional, IsNumber, Min, Max, IsDateString } from 'class-validator';

export class UpdateDiscountDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  percentage?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
