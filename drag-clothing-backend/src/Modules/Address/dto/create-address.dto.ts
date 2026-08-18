import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  addressLine1: string;

  @IsOptional()
  addressLine2?: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  state: string;

  @IsNotEmpty()
  postalCode: string;

  @IsNotEmpty()
  country: string;
}
