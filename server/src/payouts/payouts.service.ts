import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedemptionStatus, PayoutStatus, PlanTier } from '@prisma/client';

const PER_REDEMPTION_FEE: Record<string, number> = {
  [PlanTier.BASIC]: 750,
  [PlanTier.PLUS]: 1050,
  [PlanTier.PREMIUM]: 1400,
};

const OPERATOR_SHARE = 0.70;
const MIN_PAYOUT_AMOUNT = 2000; // $20 in cents

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  async calculatePayout(operatorId: string, periodStart: Date, periodEnd: Date) {
    const locations = await this.prisma.location.findMany({
      where: { operatorId },
      select: { id: true },
    });
    const locationIds = locations.map((l) => l.id);

    const redemptions = await this.prisma.redemption.findMany({
      where: {
        locationId: { in: locationIds },
        status: RedemptionStatus.VALIDATED,
        validatedAt: { gte: periodStart, lte: periodEnd },
      },
      include: {
        member: { include: { membership: { include: { plan: true } } } },
      },
    });

    let totalAmount = 0;
    for (const r of redemptions) {
      const tier = r.member.membership?.plan.tier || PlanTier.BASIC;
      const fee = PER_REDEMPTION_FEE[tier] || 750;
      const operatorAmount = Math.round(fee * OPERATOR_SHARE);
      const upgradeShare = r.upgradeAmount ? Math.round(r.upgradeAmount * OPERATOR_SHARE) : 0;
      totalAmount += operatorAmount + upgradeShare;
    }

    if (totalAmount < MIN_PAYOUT_AMOUNT) {
      return { amount: totalAmount, belowMinimum: true, redemptionCount: redemptions.length };
    }

    const payout = await this.prisma.payout.create({
      data: {
        operatorId,
        amount: totalAmount,
        status: PayoutStatus.PENDING,
        periodStart,
        periodEnd,
      },
    });

    return { ...payout, redemptionCount: redemptions.length, belowMinimum: false };
  }

  async getPayouts(userId: string) {
    const operator = await this.prisma.operator.findUnique({ where: { userId } });
    if (!operator) throw new NotFoundException('Operator not found');

    return this.prisma.payout.findMany({
      where: { operatorId: operator.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
