import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, PayoutStatus } from "@prisma/client";
import { PrismaService } from "../../lib/prisma.service";
import { CreatePayoutDto } from "./dto/create-payout.dto";
import { UpdatePayoutStatusDto } from "./dto/update-payout-status.dto";
import { AuditService } from "../audit/audit.service";
import { PaginationQueryDto, PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async list(query: PaginationQueryDto, requester: { role: string; id: string }): Promise<PaginatedResult<any>> {
    const where =
      requester.role === "affiliate"
        ? {
            affiliateId: requester.id
          }
        : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.payout.count({ where }),
      this.prisma.payout.findMany({
        where,
        include: {
          affiliate: {
            select: { id: true, email: true }
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

  async create(dto: CreatePayoutDto, actorId: string) {
    const payout = await this.prisma.payout.create({
      data: {
        affiliateId: dto.affiliateId,
        period: dto.period,
        amount: new Prisma.Decimal(dto.amount),
        status: dto.status ?? PayoutStatus.pending
      }
    });
    await this.audit.log(actorId, "payout.create", "Payout", payout.id, dto as any);
    return payout;
  }

  async updateStatus(id: string, dto: UpdatePayoutStatusDto, actorId: string) {
    await this.ensureExists(id);
    const payout = await this.prisma.payout.update({
      where: { id },
      data: {
        status: dto.status,
        paidAt: dto.status === PayoutStatus.paid ? new Date() : null
      }
    });
    await this.audit.log(actorId, "payout.status", "Payout", id, dto as any);
    return payout;
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.payout.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException("Payout not found");
    }
  }
}
