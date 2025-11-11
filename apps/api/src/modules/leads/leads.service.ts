import { Injectable, NotFoundException } from "@nestjs/common";
import { LeadStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../lib/prisma.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";
import { UpdateLeadStatusDto } from "./dto/update-lead-status.dto";
import { AuditService } from "../audit/audit.service";
import { PaginationQueryDto, PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async list(query: PaginationQueryDto, filters?: { offerId?: string; status?: LeadStatus; userId?: string }): Promise<PaginatedResult<any>> {
    const where: Prisma.LeadWhereInput = {
      ...(filters?.offerId ? { offerId: filters.offerId } : {}),
      ...(filters?.userId ? { userId: filters.userId } : {}),
      ...(filters?.status ? { status: filters.status } : {})
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        include: {
          offer: { select: { id: true, title: true, payout: true } },
          user: { select: { id: true, email: true, role: true } }
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

  async create(dto: CreateLeadDto, actorId: string) {
    const lead = await this.prisma.lead.create({
      data: {
        offerId: dto.offerId,
        userId: dto.userId,
        status: dto.status ?? LeadStatus.pending,
        revenue: dto.revenue ? new Prisma.Decimal(dto.revenue) : new Prisma.Decimal(0),
        txId: dto.txId,
        meta: dto.meta
      }
    });
    await this.audit.log(actorId, "lead.create", "Lead", lead.id, dto as any);
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto, actorId: string) {
    await this.ensureExists(id);
    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        ...dto,
        revenue: dto.revenue ? new Prisma.Decimal(dto.revenue) : undefined
      }
    });
    await this.audit.log(actorId, "lead.update", "Lead", id, dto as any);
    return lead;
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto, actorId: string) {
    await this.ensureExists(id);
    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        status: dto.status,
        approvedAt: dto.status === LeadStatus.approved ? new Date() : null
      }
    });
    await this.audit.log(actorId, "lead.status", "Lead", id, dto as any);
    return lead;
  }

  async remove(id: string, actorId: string) {
    await this.ensureExists(id);
    await this.prisma.lead.delete({ where: { id } });
    await this.audit.log(actorId, "lead.delete", "Lead", id);
    return { deleted: true };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.lead.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException("Lead not found");
    }
  }
}
