import { Controller, Get, Query } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@Controller("api/audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Roles(UserRole.admin)
  @Get()
  async list(@Query() query: PaginationQueryDto, @Query("entityType") entityType?: string) {
    return this.auditService.list(query, entityType);
  }
}
