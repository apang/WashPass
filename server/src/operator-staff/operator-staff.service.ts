import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OperatorStaffService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async addStaff(operatorUserId: string, email: string, password: string, fullName: string) {
    const operator = await this.prisma.operator.findUnique({ where: { userId: operatorUserId } });
    if (!operator) throw new NotFoundException('Operator not found');

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 12);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.OPERATOR_SCANNER,
        },
      });

      const staff = await tx.operatorStaff.create({
        data: {
          userId: user.id,
          operatorId: operator.id,
          role: UserRole.OPERATOR_SCANNER,
        },
      });

      return { id: staff.id, email, role: staff.role, isActive: staff.isActive };
    });
  }

  async removeStaff(operatorUserId: string, staffId: string) {
    const operator = await this.prisma.operator.findUnique({ where: { userId: operatorUserId } });
    if (!operator) throw new NotFoundException('Operator not found');

    const staff = await this.prisma.operatorStaff.findUnique({
      where: { id: staffId },
      include: { user: true },
    });
    if (!staff) throw new NotFoundException('Staff not found');
    if (staff.operatorId !== operator.id) throw new ForbiddenException('Not your staff');

    // Mark inactive
    await this.prisma.operatorStaff.update({
      where: { id: staffId },
      data: { isActive: false },
    });

    // Blocklist user's sessions (TTL 15 min = 900s)
    await this.redis.set(`bl:user:${staff.userId}`, '1', 900);

    // Delete all refresh tokens
    await this.prisma.refreshToken.deleteMany({
      where: { userId: staff.userId },
    });

    return { removed: true };
  }

  async listStaff(operatorUserId: string) {
    const operator = await this.prisma.operator.findUnique({ where: { userId: operatorUserId } });
    if (!operator) throw new NotFoundException('Operator not found');

    return this.prisma.operatorStaff.findMany({
      where: { operatorId: operator.id },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async changeRole(operatorUserId: string, staffId: string, role: UserRole) {
    const operator = await this.prisma.operator.findUnique({ where: { userId: operatorUserId } });
    if (!operator) throw new NotFoundException('Operator not found');

    const staff = await this.prisma.operatorStaff.findUnique({ where: { id: staffId } });
    if (!staff) throw new NotFoundException('Staff not found');
    if (staff.operatorId !== operator.id) throw new ForbiddenException('Not your staff');

    await this.prisma.operatorStaff.update({
      where: { id: staffId },
      data: { role },
    });

    await this.prisma.user.update({
      where: { id: staff.userId },
      data: { role },
    });

    return { updated: true };
  }
}
