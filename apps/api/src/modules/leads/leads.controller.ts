import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { LeadsService } from "./leads.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";
import { UpdateLeadStatusDto } from "./dto/update-lead-status.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { LeadStatus, UserRole } from "@prisma/client";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { CreatePublicLeadDto } from "./dto/create-public-lead.dto";
import { ClaimLeadDto } from "./dto/claim-lead.dto";
import { Public } from "../../common/decorators/public.decorator";

@Controller("api/leads")
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async list(
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: any,
    @Query("status") status?: string,
    @Query("targetologistId") targetologistId?: string,
    @Query("operatorId") operatorId?: string,
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    const normalizedStatus = status ? (status.toUpperCase() as LeadStatus) : undefined;
    return this.leadsService.list(
      query,
      user,
      {
        status: normalizedStatus,
        targetologistId,
        operatorId,
        from,
        to
      }
    );
  }

  @Roles(UserRole.admin, UserRole.operator, UserRole.targetolog, UserRole.client)
  @Get(":id/logs")
  async logs(@Param("id") id: string) {
    return this.leadsService.getLogs(id);
  }

  @Roles(UserRole.admin)
  @Post()
  async create(@Body() dto: CreateLeadDto, @CurrentUser() user: any) {
    return this.leadsService.create(dto, user.id);
  }

  @Public()
  @Post("ref/:code")
  async createFromReferral(@Param("code") code: string, @Body() dto: CreatePublicLeadDto) {
    return this.leadsService.createFromReferral(code, dto);
  }

  @Roles(UserRole.operator)
  @Post("claim")
  async claim(@Body() dto: ClaimLeadDto, @CurrentUser() user: any) {
    return this.leadsService.claimLead(dto, user);
  }

  @Roles(UserRole.admin, UserRole.operator, UserRole.client)
  @Post(":id/status")
  async updateStatus(@Param("id") id: string, @Body() dto: UpdateLeadStatusDto, @CurrentUser() user: any) {
    return this.leadsService.updateStatus(id, dto, user);
  }

  @Roles(UserRole.admin, UserRole.operator)
  @Patch(":id")
  async updateDetails(@Param("id") id: string, @Body() dto: UpdateLeadDto, @CurrentUser() user: any) {
    return this.leadsService.updateLeadDetails(id, dto, user.id);
  }

  @Roles(UserRole.admin)
  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.leadsService.remove(id, user.id);
  }
}
