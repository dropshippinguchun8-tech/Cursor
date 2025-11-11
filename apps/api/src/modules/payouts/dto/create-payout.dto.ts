import { IsEnum, IsNumberString, IsOptional, IsString } from "class-validator";
import { PayoutStatus } from "@prisma/client";

export class CreatePayoutDto {
  @IsString()
  affiliateId: string;

  @IsString()
  period: string;

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsEnum(PayoutStatus)
  status?: PayoutStatus;
}
