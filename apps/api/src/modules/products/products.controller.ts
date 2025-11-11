import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";

@Controller("api/products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(UserRole.admin)
  @Get()
  async list(@Query() query: PaginationQueryDto) {
    return this.productsService.list(query);
  }

  @Roles(UserRole.admin)
  @Post()
  async create(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
    return this.productsService.create(dto, user.id);
  }

  @Roles(UserRole.admin)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateProductDto, @CurrentUser() user: any) {
    return this.productsService.update(id, dto, user.id);
  }

  @Roles(UserRole.admin)
  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.productsService.remove(id, user.id);
  }
}
