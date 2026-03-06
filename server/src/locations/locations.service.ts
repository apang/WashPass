import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LocationStatus } from '@prisma/client';
import { CreateLocationDto } from './dto/create-location.dto.js';
import distance from '@turf/distance';
import { point } from '@turf/helpers';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateLocationDto) {
    const operator = await this.prisma.operator.findUnique({ where: { userId } });
    if (!operator) throw new NotFoundException('Operator not found');

    return this.prisma.location.create({
      data: {
        ...dto,
        operatorId: operator.id,
      },
    });
  }

  async update(userId: string, locationId: string, dto: Partial<CreateLocationDto>) {
    const operator = await this.prisma.operator.findUnique({ where: { userId } });
    if (!operator) throw new NotFoundException('Operator not found');

    const location = await this.prisma.location.findUnique({ where: { id: locationId } });
    if (!location) throw new NotFoundException('Location not found');
    if (location.operatorId !== operator.id) throw new ForbiddenException('Not your location');

    return this.prisma.location.update({
      where: { id: locationId },
      data: dto,
    });
  }

  async updateStatus(userId: string, locationId: string, status: LocationStatus) {
    const operator = await this.prisma.operator.findUnique({ where: { userId } });
    if (!operator) throw new NotFoundException('Operator not found');

    const location = await this.prisma.location.findUnique({ where: { id: locationId } });
    if (!location) throw new NotFoundException('Location not found');
    if (location.operatorId !== operator.id) throw new ForbiddenException('Not your location');

    return this.prisma.location.update({
      where: { id: locationId },
      data: { status },
    });
  }

  async findNearby(lat: number, lng: number, radiusKm: number = 25, cursor?: string, limit: number = 25) {
    const locations = await this.prisma.location.findMany({
      where: { status: LocationStatus.ACTIVE },
    });

    const userPoint = point([lng, lat]);
    const withDistance = locations
      .map((loc) => {
        const locPoint = point([loc.longitude, loc.latitude]);
        const dist = distance(userPoint, locPoint, { units: 'kilometers' });
        return { ...loc, distance: Math.round(dist * 100) / 100 };
      })
      .filter((loc) => loc.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    // Cursor-based pagination
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = withDistance.findIndex((loc) => loc.id === cursor);
      if (cursorIndex >= 0) startIndex = cursorIndex + 1;
    }

    const actualLimit = Math.min(limit, 100);
    const page = withDistance.slice(startIndex, startIndex + actualLimit);
    const hasMore = startIndex + actualLimit < withDistance.length;
    const nextCursor = hasMore ? page[page.length - 1]?.id : null;

    return { locations: page, hasMore, nextCursor };
  }

  async findByOperator(userId: string) {
    const operator = await this.prisma.operator.findUnique({ where: { userId } });
    if (!operator) throw new NotFoundException('Operator not found');
    return this.prisma.location.findMany({
      where: { operatorId: operator.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const location = await this.prisma.location.findUnique({ where: { id } });
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }
}
