import { IsUUID } from "class-validator";

export class ApprovePayoutDto {
  @IsUUID()
  leadId: string;
}
