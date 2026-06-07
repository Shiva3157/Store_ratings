import { IsEmail, IsString, IsNumber } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  address: string;

  @IsNumber()
  ownerId: number;
}
