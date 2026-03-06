import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DisputesService } from './disputes.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole, DisputeStatus } from '@prisma/client';

@Controller('v1/disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisputesController {
  constructor(private disputesService: DisputesService) {}

  @Post()
  @Roles(UserRole.MEMBER)
  async report(
    @Request() req: any,
    @Body() body: { redemptionId: string; type: string; description: string; photos?: string[] },
  ) {
    return this.disputesService.reportIssue(
      req.user.userId,
      body.redemptionId,
      body.type,
      body.description,
      body.photos,
    );
  }

  @Get()
  @Roles(UserRole.OPERATOR_ADMIN)
  async getDisputes(@Request() req: any) {
    return this.disputesService.getDisputesForOperator(req.user.userId);
  }

  @Patch(':id/status')
  @Roles(UserRole.OPERATOR_ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: DisputeStatus; resolution?: string },
  ) {
    return this.disputesService.updateDisputeStatus(id, body.status, body.resolution);
  }
}
