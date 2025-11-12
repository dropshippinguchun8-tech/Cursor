import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../lib/prisma.service";
import { subDays } from "date-fns";
import { LeadStatus, UserRole } from "@prisma/client";

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async totals(user: { id: string; role: UserRole }) {
    const leadWhere = this.buildLeadScope(user);

    const [totalLeads, soldLeads, operatorAssigned] = await Promise.all([
      this.prisma.lead.count({ where: leadWhere }),
      this.prisma.lead.count({ where: { ...leadWhere, status: LeadStatus.SOLD } }),
      this.prisma.lead.count({ where: { ...leadWhere, status: LeadStatus.OPERATOR_ASSIGNED } })
    ]);

    const revenue = await this.calculateRevenue(user, LeadStatus.SOLD);
    const conversionRate = totalLeads > 0 ? (soldLeads / totalLeads) * 100 : 0;

    return {
      leads: totalLeads,
      soldLeads,
      inProgress: operatorAssigned,
      revenue,
      conversionRate
    };
  }

  async timeseries(user: { id: string; role: UserRole }, days = 7) {
    const since = subDays(new Date(), days);
    const leadWhere = this.buildLeadScope(user);

    const leads = await this.prisma.lead.groupBy({
      by: ["createdAt"],
      where: {
        ...leadWhere,
        createdAt: { gte: since }
      },
      _count: { id: true }
    });

    const sold = await this.prisma.lead.groupBy({
      by: ["createdAt"],
      where: {
        ...leadWhere,
        status: LeadStatus.SOLD,
        createdAt: { gte: since }
      },
      _count: { id: true }
    });

    const toSeries = (series: typeof leads) =>
      series
        .map((row) => ({
          date: row.createdAt.toISOString().split("T")[0],
          value: row._count.id
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
      leads: toSeries(leads),
      sold: toSeries(sold)
    };
  }

  async top(user: { id: string; role: UserRole }) {
    const leadWhere = this.buildLeadScope(user);

    const products = await this.prisma.lead.groupBy({
      by: ["productId"],
      where: leadWhere,
      _count: { id: true }
    });

    const sorted = products
      .filter((p) => p.productId !== null)
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 5);

    const productIds = sorted.map((p) => p.productId as string);
    const productDetails = await this.prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    return sorted.map((entry) => {
      const product = productDetails.find((p) => p.id === entry.productId);
      return {
        id: entry.productId,
        title: product?.title ?? "Unassigned product",
        leads: entry._count.id
      };
    });
  }

  private buildLeadScope(user: { id: string; role: UserRole }) {
    switch (user.role) {
      case UserRole.targetologist:
        return { targetologistId: user.id };
      case UserRole.operator:
        return { OR: [{ operatorId: user.id }, { status: LeadStatus.NEW }] };
      case UserRole.client:
        return { clientId: user.id };
      default:
        return {};
    }
  }

  private async calculateRevenue(user: { id: string; role: UserRole }, status: LeadStatus) {
    const where = { ...this.buildLeadScope(user), status };
    if (user.role === UserRole.targetologist) {
      const result = await this.prisma.lead.aggregate({
        where,
        _sum: { commissionTargetologist: true }
      });
      return result._sum.commissionTargetologist ?? 0;
    }
    if (user.role === UserRole.operator) {
      const result = await this.prisma.lead.aggregate({
        where,
        _sum: { commissionOperator: true }
      });
      return result._sum.commissionOperator ?? 0;
    }
    const result = await this.prisma.lead.aggregate({
      where,
      _sum: {
        commissionTargetologist: true,
        commissionOperator: true
      }
    });
    const target = result._sum.commissionTargetologist ?? 0;
    const operator = result._sum.commissionOperator ?? 0;
    return Number(target) + Number(operator);
  }
}
