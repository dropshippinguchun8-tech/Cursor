import { Decimal } from "@prisma/client/runtime/library";
import { IsDecimal, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";
import { OfferStatus } from "@prisma/client";

export class CreateOfferDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  description: string;

  @IsString()
  payout: string;

  @IsString()
  link: string;

  @IsString()
  vertical: string;

  @IsString()
  geo: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  dailyCap?: number;

  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @IsOptional()
  @IsString()
  advertiserId?: string;
}
