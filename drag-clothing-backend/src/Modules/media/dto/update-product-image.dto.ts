import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProductImageDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(1000)
  imageUrl?: string;
}
