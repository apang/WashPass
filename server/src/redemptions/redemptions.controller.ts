import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RedemptionsService } from './redemptions.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '@prisma/client';

@Controller('v1/redemptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RedemptionsController {
  constructor(private redemptionsService: RedemptionsService) {}

  @Post('validate')
  @Roles(UserRole.OPERATOR_ADMIN, UserRole.OPERATOR_SCANNER)
  async validateCode(
    @Request() req: any,
    @Body('code') code: string,
  ) {
    return this.redemptionsService.validateCode(code, req.user.userId);
  }

  @Get()
  @Roles(UserRole.OPERATOR_ADMIN, UserRole.OPERATOR_SCANNER)
  async getRedemptions(
    @Request() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.redemptionsService.getOperatorRedemptions(
      req.user.userId,
      cursor,
      limit ? parseInt(limit, 10) : 25,
    );
  }
}
