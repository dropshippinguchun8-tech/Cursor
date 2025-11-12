import { IsOptional, IsString } from "class-validator";

export class CreateClickDto {
  @IsString()
  offerId: string;

  @IsString()
  affiliateId: string;

  @IsOptional()
  @IsString()
  subId?: string;
}
