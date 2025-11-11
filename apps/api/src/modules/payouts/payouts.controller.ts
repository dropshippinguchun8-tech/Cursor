import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { PayoutsService } from "./payouts.service";
import { CreatePayoutDto } from "./dto/create-payout.dto";
import { UpdatePayoutStatusDto } from "./dto/update-payout-status.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";

@Controller("api/payouts")
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get()
  async list(@Query() query: PaginationQueryDto, @CurrentUser() user: any) {
    return this.payoutsService.list(query, user);
  }

  @Roles(UserRole.admin)
  @Post()
  async create(@Body() dto: CreatePayoutDto, @CurrentUser() user: any) {
    return this.payoutsService.create(dto, user.id);
  }

  @Roles(UserRole.admin)
  @Patch(":id/status")
  async updateStatus(@Param("id") id: string, @Body() dto: UpdatePayoutStatusDto, @CurrentUser() user: any) {
    return this.payoutsService.updateStatus(id, dto, user.id);
  }
}
