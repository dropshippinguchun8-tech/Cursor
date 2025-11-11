import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../lib/prisma.service";
import { subDays } from "date-fns";

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  private scopeFilter(user: any) {
    switch (user.role) {
      case "affiliate":
        return { leads: { some: { userId: user.id } } };
      case "advertiser":
        return { advertiserId: user.id };
      case "targetolog":
        return { creatives: { some: { ownerId: user.id } } };
      default:
        return {};
    }
  }

  async totals(user: any) {
    const offerFilter = this.scopeFilter(user);
    const [clicks, leads, approved, revenue] = await Promise.all([
      this.prisma.click.count({
        where: user.role === "affiliate" ? { userId: user.id } : {}
      }),
      this.prisma.lead.count({
        where: this.leadScope(user)
      }),
      this.prisma.lead.count({
        where: { ...this.leadScope(user), status: "approved" }
      }),
      this.prisma.lead.aggregate({
        where: { ...this.leadScope(user), status: "approved" },
        _sum: { revenue: true }
      })
    ]);

    const cr = leads > 0 ? (approved / leads) * 100 : 0;

    return {
      clicks,
      leads,
      approved,
      revenue: revenue._sum.revenue ?? 0,
      conversionRate: cr
    };
  }

  async timeseries(user: any, days = 7) {
    const since = subDays(new Date(), days);
    const clicks = await this.prisma.click.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: since },
        ...(user.role === "affiliate" ? { userId: user.id } : {})
      },
      _count: { id: true }
    });

    const leads = await this.prisma.lead.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: since },
        ...this.leadScope(user)
      },
      _count: { id: true }
    });

    const mapSeries = (series: typeof clicks) =>
      series
        .map((row) => ({ date: row.createdAt.toISOString().split("T")[0], value: row._count.id }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
      clicks: mapSeries(clicks),
      leads: mapSeries(leads)
    };
  }

  async top(user: any) {
    const offerFilter = this.scopeFilter(user);
    const offers = await this.prisma.offer.findMany({
      where: offerFilter,
      include: {
        _count: {
          select: {
            leads: true,
            clicks: true
          }
        },
        leads: {
          where: { status: "approved" },
          select: { revenue: true }
        }
      },
      take: 5
    });

    return offers.map((offer) => ({
      id: offer.id,
      title: offer.title,
      leads: offer._count.leads,
      clicks: offer._count.clicks,
      revenue: offer.leads.reduce((acc, lead) => acc + Number(lead.revenue), 0)
    }));
  }

  private leadScope(user: any) {
    switch (user.role) {
      case "affiliate":
        return { userId: user.id };
      case "advertiser":
        return { offer: { advertiserId: user.id } };
      default:
        return {};
    }
  }
}
