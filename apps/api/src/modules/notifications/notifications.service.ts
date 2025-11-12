import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../lib/prisma.service";
import { PaginationQueryDto, PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: PaginationQueryDto): Promise<PaginatedResult<any>> {
    const where = { userId };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: "desc"
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

  async markRead(userId: string, notificationId?: string) {
    if (notificationId) {
      await this.prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { readAt: new Date() }
      });
    } else {
      await this.prisma.notification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() }
      });
    }
    return { success: true };
  }
}
