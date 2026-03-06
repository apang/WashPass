import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { MembershipStatus } from '@prisma/client';

@Injectable()
export class MembershipResetJob {
  private readonly logger = new Logger(MembershipResetJob.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleMembershipReset() {
    this.logger.log('Running membership reset job');

    const expiredMemberships = await this.prisma.membership.findMany({
      where: {
        status: MembershipStatus.ACTIVE,
        currentPeriodEnd: { lte: new Date() },
      },
      include: { plan: true },
    });

    for (const membership of expiredMemberships) {
      const rollover = Math.min(
        membership.washesRemaining,
        membership.plan.washesPerMonth,
      );

      await this.prisma.membership.update({
        where: { id: membership.id },
        data: {
          washesRemaining: membership.plan.washesPerMonth + rollover,
          rolloverWashes: rollover,
          currentPeriodStart: membership.currentPeriodEnd,
          currentPeriodEnd: new Date(
            membership.currentPeriodEnd!.getTime() + 30 * 24 * 60 * 60 * 1000,
          ),
        },
      });
    }

    this.logger.log(`Reset ${expiredMemberships.length} memberships`);
  }
}
