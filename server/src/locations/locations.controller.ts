import {
  Controller,
  Get,
  Put,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LocationsService } from './locations.service.js';
import { CreateLocationDto } from './dto/create-location.dto.js';
import { UpdateLocationStatusDto } from './dto/update-location-status.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '@prisma/client';

@Controller('v1/locations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Put(':id/profile')
  @Roles(UserRole.OPERATOR_ADMIN)
  async updateProfile(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreateLocationDto,
  ) {
    // If location exists, update. Otherwise create with this ID approach won't work.
    // Let's check if it exists:
    try {
      return await this.locationsService.update(req.user.userId, id, dto);
    } catch {
      return await this.locationsService.create(req.user.userId, dto);
    }
  }

  @Patch(':id/status')
  @Roles(UserRole.OPERATOR_ADMIN)
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateLocationStatusDto,
  ) {
    return this.locationsService.updateStatus(req.user.userId, id, dto.status);
  }

  @Get()
  @Roles(UserRole.OPERATOR_ADMIN)
  async getMyLocations(@Request() req: any) {
    return this.locationsService.findByOperator(req.user.userId);
  }
}
