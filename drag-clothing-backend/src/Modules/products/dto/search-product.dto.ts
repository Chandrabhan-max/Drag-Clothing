import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class SearchProductDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
