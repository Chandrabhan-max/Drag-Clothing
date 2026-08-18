import { IsString, IsEmail, IsOptional, Length } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 100)
  password: string;

  @IsString()
  @Length(6, 15)
  phone: string;

  @IsOptional()
  @IsString()
  address?: string;
}
