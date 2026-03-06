import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedemptionStatus } from '@prisma/client';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async submitRating(userId: string, redemptionId: string, stars: number, text?: string) {
    if (stars < 1 || stars > 5) throw new BadRequestException('Stars must be 1-5');

    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const redemption = await this.prisma.redemption.findUnique({
      where: { id: redemptionId },
    });
    if (!redemption) throw new NotFoundException('Redemption not found');
    if (redemption.memberId !== member.id) throw new ForbiddenException('Not your redemption');
    if (redemption.status !== RedemptionStatus.VALIDATED) {
      throw new BadRequestException('Can only rate validated washes');
    }

    // Check no existing rating
    const existing = await this.prisma.rating.findUnique({
      where: { redemptionId },
    });
    if (existing) throw new BadRequestException('Already rated');

    const rating = await this.prisma.rating.create({
      data: {
        memberId: member.id,
        locationId: redemption.locationId,
        redemptionId,
        stars,
        text,
      },
    });

    // Incrementally update location average rating
    const location = await this.prisma.location.findUnique({
      where: { id: redemption.locationId },
    });
    if (location) {
      const newTotal = location.totalRatings + 1;
      const newAvg =
        (location.avgRating * location.totalRatings + stars) / newTotal;
      await this.prisma.location.update({
        where: { id: location.id },
        data: {
          avgRating: Math.round(newAvg * 100) / 100,
          totalRatings: newTotal,
        },
      });
    }

    return rating;
  }
}
