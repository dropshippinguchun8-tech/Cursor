import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../lib/prisma.service";
import { CreateCreativeDto } from "./dto/create-creative.dto";
import { UpdateCreativeDto } from "./dto/update-creative.dto";
import { AuditService } from "../audit/audit.service";
import { PaginationQueryDto, PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class CreativesService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async list(query: PaginationQueryDto, offerId?: string): Promise<PaginatedResult<any>> {
    const where = offerId ? { offerId } : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.creative.count({ where }),
      this.prisma.creative.findMany({
        where,
        include: {
          offer: {
            select: { id: true, title: true }
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

  async create(dto: CreateCreativeDto, ownerId: string) {
    const creative = await this.prisma.creative.create({
      data: {
        offerId: dto.offerId,
        type: dto.type,
        url: dto.url,
        meta: dto.meta,
        ownerId
      }
    });
    await this.audit.log(ownerId, "creative.create", "Creative", creative.id, dto as any);
    return creative;
  }

  async update(id: string, dto: UpdateCreativeDto, actorId: string) {
    await this.ensureExists(id);
    const creative = await this.prisma.creative.update({
      where: { id },
      data: dto
    });
    await this.audit.log(actorId, "creative.update", "Creative", id, dto as any);
    return creative;
  }

  async remove(id: string, actorId: string) {
    await this.ensureExists(id);
    await this.prisma.creative.delete({ where: { id } });
    await this.audit.log(actorId, "creative.delete", "Creative", id);
    return { deleted: true };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.creative.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException("Creative not found");
    }
  }
}
