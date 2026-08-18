import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['client', 'manager'])
  role?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
