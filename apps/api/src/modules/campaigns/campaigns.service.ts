import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../lib/prisma.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { UpdateCampaignDto } from "./dto/update-campaign.dto";
import { AuditService } from "../audit/audit.service";
import { PaginationQueryDto, PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async list(query: PaginationQueryDto, targetologId: string): Promise<PaginatedResult<any>> {
    const where = { targetologId };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.campaign.count({ where }),
      this.prisma.campaign.findMany({
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

  async create(dto: CreateCampaignDto, targetologId: string) {
    const ownerId = dto.targetologId ?? targetologId;
    const campaign = await this.prisma.campaign.create({
      data: {
        name: dto.name,
        budget: new Prisma.Decimal(dto.budget),
        bid: new Prisma.Decimal(dto.bid),
        startAt: new Date(dto.startAt),
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        status: dto.status ?? "draft",
        targetologId: ownerId
      }
    });
    await this.audit.log(ownerId, "campaign.create", "Campaign", campaign.id, dto as any);
    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto, actorId: string) {
    await this.ensureExists(id);
    const campaign = await this.prisma.campaign.update({
      where: { id },
      data: {
        ...dto,
        budget: dto.budget ? new Prisma.Decimal(dto.budget) : undefined,
        bid: dto.bid ? new Prisma.Decimal(dto.bid) : undefined,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined
      }
    });
    await this.audit.log(actorId, "campaign.update", "Campaign", id, dto as any);
    return campaign;
  }

  async remove(id: string, actorId: string) {
    await this.ensureExists(id);
    await this.prisma.campaign.delete({ where: { id } });
    await this.audit.log(actorId, "campaign.delete", "Campaign", id);
    return { deleted: true };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.campaign.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException("Campaign not found");
    }
  }
}
