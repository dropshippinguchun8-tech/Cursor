import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination.dto";
import { OfferStatus } from "@prisma/client";

export class OfferQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @IsOptional()
  @IsString()
  geo?: string;

  @IsOptional()
  @IsString()
  vertical?: string;
}
