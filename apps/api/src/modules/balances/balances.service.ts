import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BalanceType, LeadStatus, TransactionDirection } from "@prisma/client";
import { PrismaService } from "../../lib/prisma.service";
import { Prisma } from "@prisma/client";

type PrismaTx = Prisma.TransactionClient | PrismaService;

@Injectable()
export class BalancesService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        holdBalance: true,
        mainBalance: true,
        balanceTransactions: {
          orderBy: { createdAt: "desc" },
          take: 20
        }
      }
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      holdBalance: Number(user.holdBalance),
      mainBalance: Number(user.mainBalance),
      transactions: user.balanceTransactions.map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount)
      }))
    };
  }

  async addHoldCredit(tx: PrismaTx, userId: string, amount: Prisma.Decimal | number, leadId: string, reason: string) {
    const decimalAmount = new Prisma.Decimal(amount);
    if (decimalAmount.lte(0)) {
      return;
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        holdBalance: { increment: decimalAmount }
      }
    });

    await tx.balanceTransaction.create({
      data: {
        userId,
        leadId,
        amount: decimalAmount,
        status: BalanceType.hold,
        type: TransactionDirection.credit,
        reason
      }
    });
  }

  async transferHoldToMain(tx: PrismaTx, userId: string, amount: Prisma.Decimal | number, leadId: string, actorId: string) {
    const decimalAmount = new Prisma.Decimal(amount);
    if (decimalAmount.lte(0)) {
      return;
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { holdBalance: true }
    });
    if (!user || user.holdBalance.lt(decimalAmount)) {
      throw new BadRequestException("Hold balance is insufficient for transfer");
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        holdBalance: { decrement: decimalAmount },
        mainBalance: { increment: decimalAmount }
      }
    });

    await tx.balanceTransaction.createMany({
      data: [
        {
          userId,
          leadId,
          amount: decimalAmount,
          status: BalanceType.hold,
          type: TransactionDirection.debit,
          reason: `Hold release by admin ${actorId}`
        },
        {
          userId,
          leadId,
          amount: decimalAmount,
          status: BalanceType.confirmed,
          type: TransactionDirection.credit,
          reason: `Hold release by admin ${actorId}`
        }
      ]
    });
  }

  async approveLeadPayout(leadId: string, actorId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        statusLogs: true
      }
    });

    if (!lead) {
      throw new NotFoundException("Lead not found");
    }

    if (lead.status !== LeadStatus.SOLD) {
      throw new BadRequestException("Lead must be sold before payout approval");
    }

    const existingCredits = await this.prisma.balanceTransaction.findMany({
      where: {
        leadId,
        status: BalanceType.confirmed,
        type: TransactionDirection.credit
      }
    });

    if (existingCredits.length > 0) {
      throw new BadRequestException("Payout already approved for this lead");
    }

    await this.prisma.$transaction(async (tx) => {
      if (lead.targetologistId && new Prisma.Decimal(lead.commissionTargetologist).gt(0)) {
        await this.transferHoldToMain(tx, lead.targetologistId, lead.commissionTargetologist, lead.id, actorId);
      }
      if (lead.operatorId && new Prisma.Decimal(lead.commissionOperator).gt(0)) {
        await this.transferHoldToMain(tx, lead.operatorId, lead.commissionOperator, lead.id, actorId);
      }
    });

    return { approved: true };
  }
}
