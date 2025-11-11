import { IsEnum, IsString, MinLength } from "class-validator";
import { LeadStatus } from "@prisma/client";

export class UpdateLeadStatusDto {
  @IsEnum(LeadStatus)
  status: LeadStatus;

  @IsString()
  @MinLength(2)
  comment: string;
}
