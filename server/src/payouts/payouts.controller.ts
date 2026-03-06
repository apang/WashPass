import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PayoutsService } from './payouts.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '@prisma/client';

@Controller('v1/payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayoutsController {
  constructor(private payoutsService: PayoutsService) {}

  @Get()
  @Roles(UserRole.OPERATOR_ADMIN)
  async getPayouts(@Request() req: any) {
    return this.payoutsService.getPayouts(req.user.userId);
  }
}
