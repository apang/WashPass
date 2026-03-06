import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedemptionStatus, DisputeStatus } from '@prisma/client';

@Injectable()
export class DisputesService {
  constructor(private prisma: PrismaService) {}

  async reportIssue(
    userId: string,
    redemptionId: string,
    type: string,
    description: string,
    photos?: string[],
  ) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const redemption = await this.prisma.redemption.findUnique({
      where: { id: redemptionId },
    });
    if (!redemption) throw new NotFoundException('Redemption not found');
    if (redemption.memberId !== member.id) throw new ForbiddenException('Not your redemption');

    // Must report within 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    if (redemption.createdAt < twoHoursAgo) {
      throw new BadRequestException('Dispute window has closed (2 hours)');
    }

    const existing = await this.prisma.dispute.findUnique({ where: { redemptionId } });
    if (existing) throw new BadRequestException('Dispute already filed');

    return this.prisma.dispute.create({
      data: {
        memberId: member.id,
        redemptionId,
        type,
        description,
        photos: photos || [],
        status: DisputeStatus.SUBMITTED,
      },
    });
  }

  async getDisputesForOperator(userId: string) {
    const operator = await this.prisma.operator.findUnique({ where: { userId } });
    if (!operator) throw new NotFoundException('Operator not found');

    const locations = await this.prisma.location.findMany({
      where: { operatorId: operator.id },
      select: { id: true },
    });
    const locationIds = locations.map((l) => l.id);

    return this.prisma.dispute.findMany({
      where: {
        redemption: { locationId: { in: locationIds } },
      },
      include: {
        member: { select: { fullName: true } },
        redemption: { include: { location: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateDisputeStatus(disputeId: string, status: DisputeStatus, resolution?: string) {
    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: { status, ...(resolution ? { resolution } : {}) },
    });
  }
}
