import { IsEnum, IsOptional, IsString } from "class-validator";
import { TicketStatus } from "@prisma/client";

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
