import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RedemptionsService } from './redemptions.service.js';
import {
  RedemptionCodeResult,
  WashHistoryResult,
} from './models/redemption.model.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '@prisma/client';

@Resolver()
export class RedemptionsResolver {
  constructor(private redemptionsService: RedemptionsService) {}

  @Mutation(() => RedemptionCodeResult)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async generateRedemptionCode(
    @CurrentUser() user: any,
    @Args('locationId') locationId: string,
  ) {
    return this.redemptionsService.generateCode(user.userId, locationId);
  }

  @Query(() => WashHistoryResult)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async washHistory(
    @CurrentUser() user: any,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 25 }) limit?: number,
  ) {
    return this.redemptionsService.getHistory(user.userId, cursor, limit);
  }
}
