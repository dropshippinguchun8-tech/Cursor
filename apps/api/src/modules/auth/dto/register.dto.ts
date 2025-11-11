import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { UserRole } from "@prisma/client";

export class RegisterDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: "Password must include uppercase letter" })
  @Matches(/[a-z]/, { message: "Password must include lowercase letter" })
  @Matches(/[0-9]/, { message: "Password must include number" })
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  telegram?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}
