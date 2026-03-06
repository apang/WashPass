import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async findAll(geoZone?: string) {
    return this.prisma.plan.findMany({
      where: {
        isActive: true,
        ...(geoZone ? { geoZone } : {}),
      },
      orderBy: { priceMonthly: 'asc' },
    });
  }

  async findById(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }
}
