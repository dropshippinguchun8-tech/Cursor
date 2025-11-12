import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CampaignsService } from "./campaigns.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { UpdateCampaignDto } from "./dto/update-campaign.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";

@Controller("api/campaigns")
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Roles(UserRole.targetolog, UserRole.admin)
  @Get()
  async list(@Query() query: PaginationQueryDto, @CurrentUser() user: any, @Query("targetologId") targetologId?: string) {
    const effectiveTargetologId = user.role === UserRole.admin && targetologId ? targetologId : user.id;
    return this.campaignsService.list(query, effectiveTargetologId);
  }

  @Roles(UserRole.targetolog, UserRole.admin)
  @Post()
  async create(@Body() dto: CreateCampaignDto, @CurrentUser() user: any) {
    return this.campaignsService.create(dto, user.id);
  }

  @Roles(UserRole.targetolog, UserRole.admin)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateCampaignDto, @CurrentUser() user: any) {
    return this.campaignsService.update(id, dto, user.id);
  }

  @Roles(UserRole.targetolog, UserRole.admin)
  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.campaignsService.remove(id, user.id);
  }
}
