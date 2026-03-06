import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true } },
        membership: { include: { plan: true } },
        vehicles: true,
      },
    });
    if (!member) throw new NotFoundException('Member not found');
    return { ...member, email: member.user.email };
  }

  async updateProfile(userId: string, data: { fullName?: string; phone?: string }) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');
    return this.prisma.member.update({
      where: { userId },
      data,
    });
  }
}
