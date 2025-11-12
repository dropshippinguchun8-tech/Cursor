import { Body, Controller, Get, Param, Post, ForbiddenException } from "@nestjs/common";
import { BalancesService } from "./balances.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { ApprovePayoutDto } from "./dto/approve-payout.dto";

@Controller("api")
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Roles(UserRole.admin, UserRole.operator, UserRole.targetologist, UserRole.client)
  @Get("users/balance/:id")
  async getUserBalance(@Param("id") id: string, @CurrentUser() user: any) {
    if (user.role !== UserRole.admin && user.id !== id) {
      throw new ForbiddenException("You can only view your own balance");
    }
    return this.balancesService.getSummary(id);
  }

  @Roles(UserRole.admin)
  @Post("admin/approve-transaction")
  async approvePayout(@Body() dto: ApprovePayoutDto, @CurrentUser() user: any) {
    return this.balancesService.approveLeadPayout(dto.leadId, user.id);
  }
}
