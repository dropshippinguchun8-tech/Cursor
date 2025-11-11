import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, UserRole, UserStatus } from "@prisma/client";
import { PrismaService } from "../../lib/prisma.service";
import { PaginationQueryDto, PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: PaginationQueryDto, filters?: Partial<{ role: UserRole; status: UserStatus }>): Promise<PaginatedResult<any>> {
    const where: Prisma.UserWhereInput = {
      ...(filters?.role ? { role: filters.role } : {}),
      ...(filters?.status ? { status: filters.status } : {})
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: {
          profile: true
        },
        orderBy: {
          createdAt: query.order,
          ...(query.sort ? { [query.sort]: query.order } : {})
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      })
    ]);

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit
      }
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        balance: true
      }
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async updateRole(id: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id },
      data: { role }
    });
  }

  async updateStatus(id: string, status: UserStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status }
    });
  }

  async updateProfile(userId: string, data: Prisma.ProfileUpdateInput) {
    return this.prisma.profile.update({
      where: { userId },
      data
    });
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }
}
