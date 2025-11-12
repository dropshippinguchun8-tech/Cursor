import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../lib/prisma.service";
import { CreateClickDto } from "./dto/create-click.dto";

@Injectable()
export class ClicksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClickDto, ip: string, userAgent?: string, referer?: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id: dto.offerId } });
    if (!offer) {
      throw new NotFoundException("Offer not found");
    }
    const affiliate = await this.prisma.user.findUnique({ where: { id: dto.affiliateId } });
    if (!affiliate) {
      throw new NotFoundException("Affiliate not found");
    }
    return this.prisma.click.create({
      data: {
        offerId: dto.offerId,
        userId: dto.affiliateId,
        subId: dto.subId,
        ip,
        userAgent,
        referer
      }
    });
  }
}
