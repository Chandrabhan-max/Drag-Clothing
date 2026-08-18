import { IsUUID, IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductVariantDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
}
