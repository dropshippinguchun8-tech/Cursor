import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreatePublicLeadDto {
  @IsUUID()
  targetologistId: string;

  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;
}
