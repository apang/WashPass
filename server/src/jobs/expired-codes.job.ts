import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedemptionStatus } from '@prisma/client';

@Injectable()
export class ExpiredCodesJob {
  private readonly logger = new Logger(ExpiredCodesJob.name);

  constructor(private prisma: PrismaService) {}

  @Cron('*/5 * * * *') // Every 5 minutes
  async handleExpiredCodes() {
    const result = await this.prisma.redemption.updateMany({
      where: {
        status: RedemptionStatus.PENDING,
        expiresAt: { lte: new Date() },
      },
      data: { status: RedemptionStatus.EXPIRED },
    });

    if (result.count > 0) {
      this.logger.log(`Expired ${result.count} redemption codes`);
    }
  }
}
