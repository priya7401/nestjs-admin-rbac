import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Role)
  role: Role;
}

export class ResetPasswordBodyDto {
  @IsNotEmpty()
  password: string;
}

export class ResetPasswordQueryDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  token: string;
}
