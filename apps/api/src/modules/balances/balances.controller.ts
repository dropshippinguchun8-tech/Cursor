import { Body, Controller, Get, Post } from "@nestjs/common";
import { BalancesService } from "./balances.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { ApprovePayoutDto } from "./dto/approve-payout.dto";

@Controller("api/balance")
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Roles(UserRole.admin, UserRole.operator, UserRole.targetolog, UserRole.client)
  @Get()
  async summary(@CurrentUser() user: any) {
    return this.balancesService.getSummary(user.id);
  }

  @Roles(UserRole.admin)
  @Post("approve-payout")
  async approvePayout(@Body() dto: ApprovePayoutDto, @CurrentUser() user: any) {
    return this.balancesService.approveLeadPayout(dto.leadId, user.id);
  }
}
