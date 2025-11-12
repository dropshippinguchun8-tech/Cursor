import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../lib/prisma.service";
import { PaginationQueryDto, PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(actorId: string, action: string, entityType: string, entityId: string, diff?: Record<string, unknown>) {
    return this.prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        diff
      }
    });
  }

  async list(query: PaginationQueryDto, entityType?: string): Promise<PaginatedResult<any>> {
    const where = entityType ? { entityType } : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        },
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
}
