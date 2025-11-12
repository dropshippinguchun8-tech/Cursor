import { Controller, Get, Query } from "@nestjs/common";
import { StatsService } from "./stats.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("api/stats")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get("totals")
  async totals(@CurrentUser() user: any) {
    return this.statsService.totals(user);
  }

  @Get("timeseries")
  async timeseries(@CurrentUser() user: any, @Query("days") days?: number) {
    return this.statsService.timeseries(user, days ? Number(days) : 7);
  }

  @Get("top")
  async top(@CurrentUser() user: any) {
    return this.statsService.top(user);
  }
}
