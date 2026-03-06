import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedemptionStatus, PlanTier } from '@prisma/client';

const PER_REDEMPTION_FEE: Record<string, number> = {
  [PlanTier.BASIC]: 750,
  [PlanTier.PLUS]: 1050,
  [PlanTier.PREMIUM]: 1400,
};

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(userId: string) {
    const operator = await this.prisma.operator.findUnique({ where: { userId } });
    if (!operator) throw new NotFoundException('Operator not found');

    const locations = await this.prisma.location.findMany({
      where: { operatorId: operator.id },
      select: { id: true, avgRating: true, totalRatings: true, name: true },
    });
    const locationIds = locations.map((l) => l.id);

    // This month's stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const redemptions = await this.prisma.redemption.findMany({
      where: {
        locationId: { in: locationIds },
        status: RedemptionStatus.VALIDATED,
        validatedAt: { gte: startOfMonth },
      },
      include: {
        member: { include: { membership: { include: { plan: true } } } },
      },
    });

    let totalRevenue = 0;
    for (const r of redemptions) {
      const tier = r.member.membership?.plan.tier || PlanTier.BASIC;
      const fee = PER_REDEMPTION_FEE[tier] || 750;
      totalRevenue += Math.round(fee * 0.70);
    }

    const totalRedemptions = redemptions.length;
    const avgRating = locations.length > 0
      ? locations.reduce((sum, l) => sum + l.avgRating, 0) / locations.length
      : 0;

    // Pending payouts
    const pendingPayouts = await this.prisma.payout.aggregate({
      where: { operatorId: operator.id, status: 'PENDING' },
      _sum: { amount: true },
    });

    return {
      totalRedemptions,
      totalRevenue,
      avgRating: Math.round(avgRating * 100) / 100,
      pendingPayoutAmount: pendingPayouts._sum.amount || 0,
      locationCount: locations.length,
      locations: locations.map((l) => ({
        id: l.id,
        name: l.name,
        avgRating: l.avgRating,
        totalRatings: l.totalRatings,
      })),
    };
  }
}
