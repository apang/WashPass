import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { make: string; model: string; year?: number; color?: string; licensePlate?: string; isDefault?: boolean }) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    if (data.isDefault) {
      await this.prisma.vehicle.updateMany({
        where: { memberId: member.id },
        data: { isDefault: false },
      });
    }

    return this.prisma.vehicle.create({
      data: { ...data, memberId: member.id },
    });
  }

  async findAllByMember(userId: string) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');
    return this.prisma.vehicle.findMany({ where: { memberId: member.id }, orderBy: { createdAt: 'desc' } });
  }

  async remove(userId: string, vehicleId: string) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle || vehicle.memberId !== member.id) throw new ForbiddenException('Not your vehicle');

    return this.prisma.vehicle.delete({ where: { id: vehicleId } });
  }

  async setDefault(userId: string, vehicleId: string) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle || vehicle.memberId !== member.id) throw new ForbiddenException('Not your vehicle');

    await this.prisma.vehicle.updateMany({
      where: { memberId: member.id },
      data: { isDefault: false },
    });

    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { isDefault: true },
    });
  }
}
