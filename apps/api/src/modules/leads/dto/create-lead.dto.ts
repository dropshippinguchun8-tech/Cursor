import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateLeadDto {
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

  @IsUUID()
  targetologistId: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;
}
