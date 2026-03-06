import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { MembershipStatus } from '@prisma/client';

@Injectable()
export class PauseResumeJob {
  private readonly logger = new Logger(PauseResumeJob.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handlePauseResume() {
    this.logger.log('Running pause resume job');

    const result = await this.prisma.membership.updateMany({
      where: {
        status: MembershipStatus.PAUSED,
        pausedUntil: { lte: new Date() },
      },
      data: {
        status: MembershipStatus.ACTIVE,
        pausedUntil: null,
      },
    });

    this.logger.log(`Resumed ${result.count} paused memberships`);
  }
}
