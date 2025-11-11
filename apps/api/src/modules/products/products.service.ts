import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../lib/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { AuditService } from "../audit/audit.service";
import { PaginationQueryDto, PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async list(query: PaginationQueryDto): Promise<PaginatedResult<any>> {
    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count(),
      this.prisma.product.findMany({
        include: {
          owner: {
            select: { id: true, email: true }
          },
          offer: {
            select: { id: true, title: true }
          }
        },
        orderBy: query.sort
          ? {
              [query.sort]: query.order
            }
          : {
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

  async create(dto: CreateProductDto, ownerId: string) {
    const product = await this.prisma.product.create({
      data: {
        title: dto.title,
        sku: dto.sku,
        price: new Prisma.Decimal(dto.price),
        currency: dto.currency,
        stock: dto.stock,
        images: dto.images,
        attributes: dto.attributes,
        ownerId,
        offerId: dto.offerId
      }
    });
    await this.audit.log(ownerId, "product.create", "Product", product.id, dto as any);
    return product;
  }

  async update(id: string, dto: UpdateProductDto, actorId: string) {
    await this.ensureExists(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        price: dto.price ? new Prisma.Decimal(dto.price) : undefined
      }
    });
    await this.audit.log(actorId, "product.update", "Product", id, dto as any);
    return product;
  }

  async remove(id: string, actorId: string) {
    await this.ensureExists(id);
    await this.prisma.product.delete({ where: { id } });
    await this.audit.log(actorId, "product.delete", "Product", id);
    return { deleted: true };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException("Product not found");
    }
  }
}
