import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { TicketsService } from "./tickets.service";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { UpdateTicketDto } from "./dto/update-ticket.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";

@Controller("api/tickets")
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  async list(@Query() query: PaginationQueryDto, @CurrentUser() user: any, @Query("assigneeId") assigneeId?: string) {
    const filters: { authorId?: string; assigneeId?: string } = {};
    if (user.role === UserRole.admin || user.role === UserRole.operator) {
      if (assigneeId) {
        filters.assigneeId = assigneeId;
      }
    } else {
      filters.authorId = user.id;
    }
    return this.ticketsService.list(query, filters);
  }

  @Post()
  async create(@Body() dto: CreateTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.create(dto, user.id);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.update(id, dto, user.id);
  }

  @Roles(UserRole.admin, UserRole.operator)
  @Post(":id/assign")
  async assign(@Param("id") id: string, @Body("assigneeId") assigneeId: string, @CurrentUser() user: any) {
    return this.ticketsService.assign(id, assigneeId, user.id);
  }
}
