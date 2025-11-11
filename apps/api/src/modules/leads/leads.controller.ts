import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { LeadsService } from "./leads.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";
import { UpdateLeadStatusDto } from "./dto/update-lead-status.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole, LeadStatus } from "@prisma/client";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";

@Controller("api/leads")
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async list(
    @Query() query: PaginationQueryDto,
    @Query("offerId") offerId?: string,
    @Query("status") status?: LeadStatus,
    @CurrentUser() user?: any
  ) {
    const filters: { offerId?: string; status?: LeadStatus; userId?: string } = {};
    if (offerId) filters.offerId = offerId;
    if (status) filters.status = status;
    if (user?.role === UserRole.affiliate) {
      filters.userId = user.id;
    }
    return this.leadsService.list(query, filters);
  }

  @Roles(UserRole.admin, UserRole.advertiser, UserRole.affiliate)
  @Post()
  async create(@Body() dto: CreateLeadDto, @CurrentUser() user: any) {
    return this.leadsService.create(dto, user.id);
  }

  @Roles(UserRole.admin, UserRole.advertiser)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateLeadDto, @CurrentUser() user: any) {
    return this.leadsService.update(id, dto, user.id);
  }

  @Roles(UserRole.admin, UserRole.operator)
  @Patch(":id/status")
  async updateStatus(@Param("id") id: string, @Body() dto: UpdateLeadStatusDto, @CurrentUser() user: any) {
    return this.leadsService.updateStatus(id, dto, user.id);
  }

  @Roles(UserRole.admin)
  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.leadsService.remove(id, user.id);
  }
}
