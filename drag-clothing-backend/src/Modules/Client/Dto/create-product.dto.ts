import { IsEnum, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { Gender } from 'src/common/enums/gender.enum';
import { ProductType } from 'src/common/enums/product-type.enum';

export class CreateProductDto {
  @IsUUID()
  categoryId: string;

  @IsEnum(ProductType)
  type: ProductType;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(Gender)
  gender: Gender;
}
