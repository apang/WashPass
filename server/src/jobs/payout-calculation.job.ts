import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { PayoutsService } from '../payouts/payouts.service.js';

@Injectable()
export class PayoutCalculationJob {
  private readonly logger = new Logger(PayoutCalculationJob.name);

  constructor(
    private prisma: PrismaService,
    private payoutsService: PayoutsService,
  ) {}

  @Cron('59 23 * * 1') // Monday 11:59 PM
  async handlePayoutCalculation() {
    this.logger.log('Running weekly payout calculation');

    const operators = await this.prisma.operator.findMany({
      where: { isVerified: true },
    });

    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 7);

    for (const operator of operators) {
      try {
        await this.payoutsService.calculatePayout(
          operator.id,
          periodStart,
          periodEnd,
        );
      } catch (error) {
        this.logger.error(`Payout calc failed for operator ${operator.id}`, error);
      }
    }

    this.logger.log(`Calculated payouts for ${operators.length} operators`);
  }
}
