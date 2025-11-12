import { IsArray, IsInt, IsNumberString, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  sku: string;

  @IsNumberString()
  price: string;

  @IsString()
  currency: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsOptional()
  attributes?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  offerId?: string;
}
