import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreativesService } from "./creatives.service";
import { CreateCreativeDto } from "./dto/create-creative.dto";
import { UpdateCreativeDto } from "./dto/update-creative.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";

@Controller("api/creatives")
export class CreativesController {
  constructor(private readonly creativesService: CreativesService) {}

  @Get()
  async list(@Query() query: PaginationQueryDto, @Query("offerId") offerId?: string) {
    return this.creativesService.list(query, offerId);
  }

  @Roles(UserRole.admin, UserRole.targetologist, UserRole.advertiser)
  @Post()
  async create(@Body() dto: CreateCreativeDto, @CurrentUser() user: any) {
    return this.creativesService.create(dto, user.id);
  }

  @Roles(UserRole.admin, UserRole.targetologist, UserRole.advertiser)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateCreativeDto, @CurrentUser() user: any) {
    return this.creativesService.update(id, dto, user.id);
  }

  @Roles(UserRole.admin, UserRole.targetologist)
  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.creativesService.remove(id, user.id);
  }
}
