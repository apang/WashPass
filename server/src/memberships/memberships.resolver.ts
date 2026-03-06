import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MembershipsService } from './memberships.service.js';
import { MembershipModel } from './models/membership.model.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '@prisma/client';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class SubscribeResult {
  @Field({ nullable: true })
  checkoutUrl?: string;

  @Field({ nullable: true })
  sessionId?: string;
}

@Resolver(() => MembershipModel)
export class MembershipsResolver {
  constructor(private membershipsService: MembershipsService) {}

  @Query(() => MembershipModel, { nullable: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async myMembership(@CurrentUser() user: any) {
    return this.membershipsService.getMembership(user.userId);
  }

  @Mutation(() => SubscribeResult)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async subscribe(
    @CurrentUser() user: any,
    @Args('planId') planId: string,
  ) {
    return this.membershipsService.subscribe(user.userId, planId);
  }

  @Mutation(() => MembershipModel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async pauseMembership(
    @CurrentUser() user: any,
    @Args('durationDays', { type: () => Int, defaultValue: 30 }) durationDays: number,
  ) {
    return this.membershipsService.pause(user.userId, durationDays);
  }

  @Mutation(() => MembershipModel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async resumeMembership(@CurrentUser() user: any) {
    return this.membershipsService.resume(user.userId);
  }

  @Mutation(() => MembershipModel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async cancelMembership(@CurrentUser() user: any) {
    return this.membershipsService.cancel(user.userId);
  }
}
