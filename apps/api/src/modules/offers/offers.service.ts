import { Injectable, NotFoundException } from "@nestjs/common";
import { OfferStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../lib/prisma.service";
import { OfferQueryDto } from "./dto/offer-query.dto";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: OfferQueryDto): Promise<PaginatedResult<any>> {
    const where: Prisma.OfferWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.geo ? { geo: query.geo } : {}),
      ...(query.vertical ? { vertical: query.vertical } : {})
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.offer.count({ where }),
      this.prisma.offer.findMany({
        where,
        include: {
          advertiser: {
            select: {
              id: true,
              email: true,
              username: true
            }
          },
          creatives: true,
          products: true
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

  async findById(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        advertiser: true,
        creatives: true,
        products: true,
        leads: {
          take: 10,
          orderBy: { createdAt: "desc" }
        }
      }
    });
    if (!offer) {
      throw new NotFoundException("Offer not found");
    }
    return offer;
  }

  async create(dto: CreateOfferDto, advertiserId: string) {
    return this.prisma.offer.create({
      data: {
        title: dto.title,
        description: dto.description,
        payout: new Prisma.Decimal(dto.payout),
        link: dto.link,
        status: dto.status ?? OfferStatus.active,
        vertical: dto.vertical,
        geo: dto.geo,
        dailyCap: dto.dailyCap,
        advertiserId: dto.advertiserId ?? advertiserId
      }
    });
  }

  async update(id: string, dto: UpdateOfferDto) {
    await this.ensureExists(id);
    return this.prisma.offer.update({
      where: { id },
      data: {
        ...dto,
        payout: dto.payout ? new Prisma.Decimal(dto.payout) : undefined
      }
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.offer.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.offer.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException("Offer not found");
    }
  }
}
