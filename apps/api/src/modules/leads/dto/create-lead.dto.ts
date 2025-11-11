import { IsEnum, IsOptional, IsString } from "class-validator";
import { LeadStatus } from "@prisma/client";

export class CreateLeadDto {
  @IsString()
  offerId: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  revenue?: string;

  @IsOptional()
  @IsString()
  txId?: string;

  @IsOptional()
  meta?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;
}
