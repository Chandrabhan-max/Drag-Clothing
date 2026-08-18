import { IsString, IsUUID, IsNumber, Min } from 'class-validator';

export class CreateManagerProductDto {
  @IsUUID()
  categoryId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;
}
