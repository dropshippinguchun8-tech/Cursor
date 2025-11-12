import { IsEnum, IsOptional, IsString } from "class-validator";
import { CreativeType } from "@prisma/client";

export class CreateCreativeDto {
  @IsString()
  offerId: string;

  @IsEnum(CreativeType)
  type: CreativeType;

  @IsString()
  url: string;

  @IsOptional()
  meta?: Record<string, unknown>;
}
