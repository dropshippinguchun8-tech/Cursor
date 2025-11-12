import { Body, Controller, Delete, Get, Param, Post, Patch, Query } from "@nestjs/common";
import { OffersService } from "./offers.service";
import { OfferQueryDto } from "./dto/offer-query.dto";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";

@Controller("api/offers")
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  async findAll(@Query() query: OfferQueryDto) {
    return this.offersService.findMany(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.offersService.findById(id);
  }

  @Roles(UserRole.admin, UserRole.advertiser)
  @Post()
  async create(@Body() dto: CreateOfferDto, @CurrentUser() user: any) {
    const advertiserId = user.role === UserRole.admin && dto["advertiserId"] ? dto["advertiserId"] : user.id;
    return this.offersService.create(dto, advertiserId);
  }

  @Roles(UserRole.admin, UserRole.advertiser)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateOfferDto) {
    return this.offersService.update(id, dto);
  }

  @Roles(UserRole.admin)
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.offersService.remove(id);
  }
}
