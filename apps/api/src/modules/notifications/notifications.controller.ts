import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("api/notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(@CurrentUser() user: any, @Query() query: PaginationQueryDto) {
    return this.notificationsService.list(user.id, query);
  }

  @Post("mark-read")
  async markRead(@CurrentUser() user: any, @Body("notificationId") notificationId?: string) {
    return this.notificationsService.markRead(user.id, notificationId);
  }
}
