import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateManagerDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;
}
