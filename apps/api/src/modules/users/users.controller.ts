import { Body, Controller, Delete, Get, Param, Patch, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole, UserStatus } from "@prisma/client";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("api/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.admin, UserRole.operator)
  @Get()
  async list(
    @Query() query: PaginationQueryDto,
    @Query("role") role?: UserRole,
    @Query("status") status?: string
  ) {
    const normalizedStatus = status ? (status as UserStatus) : undefined;
    return this.usersService.findMany(query, {
      role,
      status: normalizedStatus
    });
  }

  @Get("me")
  async me(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Patch("me")
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Roles(UserRole.admin)
  @Patch(":id/role")
  async updateRole(@Param("id") id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto.role);
  }

  @Roles(UserRole.admin, UserRole.operator)
  @Patch(":id/status")
  async updateStatus(@Param("id") id: string, @Body() dto: UpdateUserStatusDto) {
    return this.usersService.updateStatus(id, dto.status);
  }

  @Roles(UserRole.admin)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.usersService.delete(id);
  }
}
