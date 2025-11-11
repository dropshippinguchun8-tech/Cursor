import { IsString, IsUUID } from "class-validator";

export class ClaimLeadDto {
  @IsUUID()
  leadId: string;

  @IsString()
  comment: string;
}
