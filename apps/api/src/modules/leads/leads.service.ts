import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { LeadStatus, Prisma, UserRole } from "@prisma/client";
import { PrismaService } from "../../lib/prisma.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";
import { UpdateLeadStatusDto } from "./dto/update-lead-status.dto";
import { AuditService } from "../audit/audit.service";
import { PaginationQueryDto, PaginatedResult } from "../../common/dto/pagination.dto";
import { CreatePublicLeadDto } from "./dto/create-public-lead.dto";
import { ClaimLeadDto } from "./dto/claim-lead.dto";
import { BalancesService } from "../balances/balances.service";
import { Prisma as PrismaClientNS } from "@prisma/client";

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly balances: BalancesService
  ) {}

  private readonly operatorTransitions = {
    [LeadStatus.NEW]: [LeadStatus.OPERATOR_ASSIGNED],
    [LeadStatus.OPERATOR_ASSIGNED]: [LeadStatus.ACCEPTED, LeadStatus.ARCHIVED]
  };

  private readonly adminTransitions = {
    [LeadStatus.ACCEPTED]: [LeadStatus.SENT],
    [LeadStatus.SENT]: [LeadStatus.SOLD],
    [LeadStatus.ARCHIVED]: [],
    [LeadStatus.NEW]: [LeadStatus.ARCHIVED],
    [LeadStatus.OPERATOR_ASSIGNED]: [LeadStatus.ARCHIVED]
  };

  private readonly clientTransitions = {
    [LeadStatus.OPERATOR_ASSIGNED]: [LeadStatus.ACCEPTED, LeadStatus.ARCHIVED],
    [LeadStatus.ACCEPTED]: [LeadStatus.ARCHIVED]
  };

  async list(
    query: PaginationQueryDto,
    currentUser: { id: string; role: UserRole },
    filters?: { status?: LeadStatus; targetologistId?: string; operatorId?: string; from?: string; to?: string }
  ): Promise<PaginatedResult<any>> {
    const where: Prisma.LeadWhereInput = {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.targetologistId ? { targetologistId: filters.targetologistId } : {}),
      ...(filters?.operatorId ? { operatorId: filters.operatorId } : {}),
      ...(filters?.from || filters?.to
        ? {
            createdAt: {
              gte: filters?.from ? new Date(filters.from) : undefined,
              lte: filters?.to ? new Date(filters.to) : undefined
            }
          }
        : {})
    };

    if (currentUser.role === UserRole.targetolog) {
      where.targetologistId = currentUser.id;
    }
    if (currentUser.role === UserRole.operator) {
      where.OR = [
        { operatorId: currentUser.id },
        { operatorId: null, status: LeadStatus.NEW }
      ];
    }
    if (currentUser.role === UserRole.client) {
      where.clientId = currentUser.id;
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        include: {
          product: { select: { id: true, title: true, commissionOperator: true, commissionTargetologist: true } },
          targetologist: { select: { id: true, username: true, email: true } },
          operator: { select: { id: true, username: true, email: true } },
          statusLogs: {
            orderBy: { createdAt: "desc" },
            take: 5
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

  async getLogs(leadId: string) {
    await this.ensureExists(leadId);
    return this.prisma.leadStatusLog.findMany({
      where: { leadId },
      include: {
        actor: { select: { id: true, username: true, role: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async create(dto: CreateLeadDto, actorId: string) {
    const targetologist = await this.prisma.user.findUnique({
      where: { id: dto.targetologistId },
      select: { id: true, role: true, referralCode: true }
    });
    if (!targetologist || targetologist.role !== UserRole.targetolog) {
      throw new BadRequestException("Targetologist not found");
    }

    const product = dto.productId
      ? await this.prisma.product.findUnique({ where: { id: dto.productId } })
      : null;

    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          referralCode: targetologist.referralCode ?? targetologist.id,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail,
          notes: dto.notes ? { text: dto.notes } : undefined,
          targetologistId: targetologist.id,
          productId: product?.id,
          commissionTargetologist: product?.commissionTargetologist ?? new Prisma.Decimal(0),
          commissionOperator: product?.commissionOperator ?? new Prisma.Decimal(0)
        }
      });

      await this.recordStatus(tx, lead.id, actorId, null, LeadStatus.NEW, "Lead created");
      await this.audit.log(actorId, "lead.create", "Lead", lead.id, dto as any);
      return lead;
    });
  }

  async createFromReferral(code: string, dto: CreatePublicLeadDto) {
    const targetologist = await this.prisma.user.findFirst({
      where: {
        OR: [{ referralCode: code }, { id: code }],
        role: UserRole.targetolog
      }
    });
    if (!targetologist) {
      throw new NotFoundException("Referral link invalid");
    }

    const product = dto.productId
      ? await this.prisma.product.findUnique({ where: { id: dto.productId } })
      : null;

    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          referralCode: targetologist.referralCode ?? targetologist.id,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail,
          notes: dto.notes ? { text: dto.notes } : undefined,
          targetologistId: targetologist.id,
          productId: product?.id,
          commissionTargetologist: product?.commissionTargetologist ?? new Prisma.Decimal(0),
          commissionOperator: product?.commissionOperator ?? new Prisma.Decimal(0)
        }
      });

      await this.recordStatus(tx, lead.id, targetologist.id, null, LeadStatus.NEW, "Lead captured via referral");
      return lead;
    });
  }

  async claimLead(dto: ClaimLeadDto, operator: { id: string; role: UserRole }) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: dto.leadId }
    });
    if (!lead) {
      throw new NotFoundException("Lead not found");
    }

    if (lead.status !== LeadStatus.NEW) {
      throw new BadRequestException("Only new leads can be claimed");
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.lead.update({
        where: { id: dto.leadId },
        data: {
          status: LeadStatus.OPERATOR_ASSIGNED,
          operatorId: operator.id
        }
      });

      await this.recordStatus(tx, updated.id, operator.id, LeadStatus.NEW, LeadStatus.OPERATOR_ASSIGNED, dto.comment);
      await this.audit.log(operator.id, "lead.claim", "Lead", updated.id, { comment: dto.comment });
      return updated;
    });
  }

  async updateStatus(
    leadId: string,
    dto: UpdateLeadStatusDto,
    actor: { id: string; role: UserRole }
  ) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId }
    });
    if (!lead) {
      throw new NotFoundException("Lead not found");
    }

    const allowed = this.getAllowedStatuses(lead.status, actor.role);
    if (!allowed.includes(dto.status)) {
      throw new ForbiddenException("Status transition not allowed");
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.lead.update({
        where: { id: leadId },
        data: {
          status: dto.status
        }
      });

      await this.recordStatus(tx, leadId, actor.id, lead.status, dto.status, dto.comment);
      await this.audit.log(actor.id, "lead.status", "Lead", leadId, { from: lead.status, to: dto.status, comment: dto.comment });

      if (dto.status === LeadStatus.SOLD) {
        await this.handleSoldCommission(tx, updated);
      }

      return updated;
    });
  }

  async updateLeadDetails(id: string, dto: UpdateLeadDto, actorId: string) {
    await this.ensureExists(id);
    const data: Prisma.LeadUpdateInput = {};
    if (dto.customerName !== undefined) data.customerName = dto.customerName;
    if (dto.customerPhone !== undefined) data.customerPhone = dto.customerPhone;
    if (dto.customerEmail !== undefined) data.customerEmail = dto.customerEmail;
    if (dto.notes !== undefined) data.notes = dto.notes ? { text: dto.notes } : Prisma.JsonNull;
    if (dto.productId !== undefined) data.product = { connect: { id: dto.productId } };

    const lead = await this.prisma.lead.update({
      where: { id },
      data
    });
    await this.audit.log(actorId, "lead.update", "Lead", id, dto as any);
    return lead;
  }

  async remove(id: string, actorId: string) {
    await this.ensureExists(id);
    await this.prisma.lead.delete({ where: { id } });
    await this.audit.log(actorId, "lead.delete", "Lead", id);
    return { deleted: true };
  }

  private async handleSoldCommission(tx: PrismaClientNS.TransactionClient, lead: { id: string; targetologistId: string; operatorId: string | null; commissionTargetologist: Prisma.Decimal; commissionOperator: Prisma.Decimal }) {
    if (lead.targetologistId) {
      await this.balances.addHoldCredit(tx, lead.targetologistId, lead.commissionTargetologist, lead.id, "Commission awaiting approval");
    }
    if (lead.operatorId) {
      await this.balances.addHoldCredit(tx, lead.operatorId, lead.commissionOperator, lead.id, "Commission awaiting approval");
    }
  }

  private getAllowedStatuses(current: LeadStatus, role: UserRole): LeadStatus[] {
    if (role === UserRole.operator) {
      return this.operatorTransitions[current] ?? [];
    }
    if (role === UserRole.admin) {
      return this.adminTransitions[current] ?? [];
    }
    if (role === UserRole.client) {
      return this.clientTransitions[current] ?? [];
    }
    return [];
  }

  private async recordStatus(
    tx: PrismaClientNS.TransactionClient,
    leadId: string,
    actorId: string | null,
    previousStatus: LeadStatus | null,
    newStatus: LeadStatus,
    comment: string
  ) {
    await tx.leadStatusLog.create({
      data: {
        leadId,
        actorId: actorId ?? undefined,
        previousStatus: previousStatus ?? undefined,
        newStatus,
        comment
      }
    });
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.lead.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException("Lead not found");
    }
  }
}
