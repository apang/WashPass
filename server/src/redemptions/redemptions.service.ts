import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { MembershipStatus, RedemptionStatus, LocationStatus } from '@prisma/client';
import { nanoid } from 'nanoid';
import * as QRCode from 'qrcode';

@Injectable()
export class RedemptionsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async generateCode(userId: string, locationId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: { membership: { include: { plan: true } } },
    });
    if (!member) throw new NotFoundException('Member not found');
    if (!member.membership || member.membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestException('No active membership');
    }
    if (member.membership.washesRemaining <= 0) {
      throw new BadRequestException('No washes remaining');
    }

    const location = await this.prisma.location.findUnique({ where: { id: locationId } });
    if (!location || location.status !== LocationStatus.ACTIVE) {
      throw new NotFoundException('Location not available');
    }

    // Rate limit: 5 codes per minute
    const rateLimitKey = `rl:code:${userId}`;
    const count = await this.redis.incr(rateLimitKey);
    if (count === 1) await this.redis.expire(rateLimitKey, 60);
    if (count > 5) throw new BadRequestException('Too many code requests. Try again later.');

    const code = nanoid(12);
    const numericCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const redemption = await this.prisma.$transaction(async (tx) => {
      // Decrement washes
      await tx.membership.update({
        where: { id: member.membership!.id },
        data: { washesRemaining: { decrement: 1 } },
      });

      return tx.redemption.create({
        data: {
          memberId: member.id,
          locationId,
          code,
          numericCode,
          status: RedemptionStatus.PENDING,
          expiresAt,
        },
      });
    });

    // Cache in Redis for fast lookup (10 min TTL)
    await this.redis.set(
      `code:${code}`,
      JSON.stringify({
        id: redemption.id,
        memberId: member.id,
        memberName: member.fullName,
        planTier: member.membership.plan.tier,
        locationId,
        expiresAt: expiresAt.toISOString(),
      }),
      600,
    );

    const qrDataUrl = await QRCode.toDataURL(code);

    return { code, numericCode, qrDataUrl, expiresAt };
  }

  async validateCode(code: string, operatorUserId: string) {
    // Check Redis first for fast lookup
    const cached = await this.redis.get(`code:${code}`);
    let redemptionData: any;

    if (cached) {
      redemptionData = JSON.parse(cached);
    } else {
      // Fallback to DB
      const redemption = await this.prisma.redemption.findUnique({
        where: { code },
        include: {
          member: { include: { membership: { include: { plan: true } } } },
        },
      });
      if (!redemption) throw new NotFoundException('Invalid code');
      redemptionData = {
        id: redemption.id,
        memberId: redemption.memberId,
        memberName: redemption.member.fullName,
        planTier: redemption.member.membership?.plan.tier,
        locationId: redemption.locationId,
        expiresAt: redemption.expiresAt.toISOString(),
        status: redemption.status,
      };
    }

    // Verify operator owns the location
    const operator = await this.prisma.operator.findUnique({
      where: { userId: operatorUserId },
    });
    // Also check if user is operator staff
    let operatorId = operator?.id;
    if (!operatorId) {
      const staff = await this.prisma.operatorStaff.findUnique({
        where: { userId: operatorUserId },
      });
      if (staff?.isActive) operatorId = staff.operatorId;
    }
    if (!operatorId) throw new ForbiddenException('Not an operator');

    const location = await this.prisma.location.findUnique({
      where: { id: redemptionData.locationId },
    });
    if (!location || location.operatorId !== operatorId) {
      throw new ForbiddenException('Code not for your location');
    }

    // Verify status and expiry
    const dbRedemption = await this.prisma.redemption.findUnique({ where: { id: redemptionData.id } });
    if (!dbRedemption) throw new NotFoundException('Redemption not found');
    if (dbRedemption.status !== RedemptionStatus.PENDING) {
      throw new BadRequestException(`Code already ${dbRedemption.status.toLowerCase()}`);
    }
    if (new Date() > dbRedemption.expiresAt) {
      await this.prisma.redemption.update({
        where: { id: dbRedemption.id },
        data: { status: RedemptionStatus.EXPIRED },
      });
      throw new BadRequestException('Code expired');
    }

    // Validate the code
    await this.prisma.redemption.update({
      where: { id: dbRedemption.id },
      data: { status: RedemptionStatus.VALIDATED, validatedAt: new Date() },
    });

    // Remove from Redis cache
    await this.redis.del(`code:${code}`);

    return {
      valid: true,
      memberName: redemptionData.memberName,
      planTier: redemptionData.planTier,
      redemptionId: dbRedemption.id,
    };
  }

  async getHistory(userId: string, cursor?: string, limit: number = 25) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const actualLimit = Math.min(limit, 100);
    const redemptions = await this.prisma.redemption.findMany({
      where: { memberId: member.id },
      include: { location: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: actualLimit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = redemptions.length > actualLimit;
    const items = redemptions.slice(0, actualLimit).map((r) => ({
      ...r,
      locationName: r.location.name,
    }));
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return { items, hasMore, nextCursor };
  }

  async getOperatorRedemptions(userId: string, cursor?: string, limit: number = 25) {
    const operator = await this.prisma.operator.findUnique({ where: { userId } });
    let operatorId = operator?.id;
    if (!operatorId) {
      const staff = await this.prisma.operatorStaff.findUnique({ where: { userId } });
      if (staff?.isActive) operatorId = staff.operatorId;
    }
    if (!operatorId) throw new ForbiddenException('Not an operator');

    const locations = await this.prisma.location.findMany({
      where: { operatorId },
      select: { id: true },
    });
    const locationIds = locations.map((l) => l.id);

    const actualLimit = Math.min(limit, 100);
    const redemptions = await this.prisma.redemption.findMany({
      where: { locationId: { in: locationIds } },
      include: {
        location: { select: { name: true } },
        member: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: actualLimit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = redemptions.length > actualLimit;
    const items = redemptions.slice(0, actualLimit);

    return {
      items,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
    };
  }
}
