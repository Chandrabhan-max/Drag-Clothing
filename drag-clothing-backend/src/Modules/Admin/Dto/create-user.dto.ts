import {
  IsString,
  IsEmail,
  IsOptional,
  Length,
  IsIn,
  IsEnum,
} from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 100)
  password: string;

  @IsString()
  @Length(2, 50)
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  clientId?: string;
}
