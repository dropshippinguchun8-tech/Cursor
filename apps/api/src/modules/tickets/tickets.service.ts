import { Injectable, NotFoundException } from "@nestjs/common";
import { TicketStatus } from "@prisma/client";
import { PrismaService } from "../../lib/prisma.service";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { UpdateTicketDto } from "./dto/update-ticket.dto";
import { AuditService } from "../audit/audit.service";
import { PaginationQueryDto, PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async list(query: PaginationQueryDto, filters: { authorId?: string; assigneeId?: string }) {
    const where: any = {};
    if (filters.authorId) {
      where.authorId = filters.authorId;
    }
    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        include: {
          author: { select: { id: true, email: true, role: true } },
          assignee: { select: { id: true, email: true, role: true } }
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

  async create(dto: CreateTicketDto, authorId: string) {
    const ticket = await this.prisma.ticket.create({
      data: {
        subject: dto.subject,
        body: dto.body,
        authorId,
        assigneeId: dto.assigneeId,
        status: TicketStatus.open
      }
    });
    await this.audit.log(authorId, "ticket.create", "Ticket", ticket.id, dto as any);
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, actorId: string) {
    await this.ensureExists(id);
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date()
      }
    });
    await this.audit.log(actorId, "ticket.update", "Ticket", id, dto as any);
    return ticket;
  }

  async assign(id: string, assigneeId: string, actorId: string) {
    await this.ensureExists(id);
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { assigneeId, status: TicketStatus.in_progress }
    });
    await this.audit.log(actorId, "ticket.assign", "Ticket", id, { assigneeId });
    return ticket;
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.ticket.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException("Ticket not found");
    }
  }
}
