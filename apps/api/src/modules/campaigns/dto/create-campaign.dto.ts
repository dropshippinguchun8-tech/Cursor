import { IsDateString, IsNumberString, IsOptional, IsString } from "class-validator";

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsNumberString()
  budget: string;

  @IsNumberString()
  bid: string;

  @IsDateString()
  startAt: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  targetologId?: string;
}
