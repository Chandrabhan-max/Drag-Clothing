import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateProductImageDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(1000)
  imageUrl: string;
}
