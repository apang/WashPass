import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MembersService } from './members.service.js';
import { MemberModel } from './models/member.model.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '@prisma/client';

@Resolver(() => MemberModel)
export class MembersResolver {
  constructor(private membersService: MembersService) {}

  @Query(() => MemberModel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async memberProfile(@CurrentUser() user: any) {
    return this.membersService.getProfile(user.userId);
  }

  @Mutation(() => MemberModel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async updateMemberProfile(
    @CurrentUser() user: any,
    @Args('fullName', { nullable: true }) fullName?: string,
    @Args('phone', { nullable: true }) phone?: string,
  ) {
    return this.membersService.updateProfile(user.userId, { fullName, phone });
  }
}
