import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DisputesService } from './disputes.service.js';
import { DisputeModel } from './models/dispute.model.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '@prisma/client';

@Resolver(() => DisputeModel)
export class DisputesResolver {
  constructor(private disputesService: DisputesService) {}

  @Mutation(() => DisputeModel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async reportIssue(
    @CurrentUser() user: any,
    @Args('redemptionId') redemptionId: string,
    @Args('type') type: string,
    @Args('description') description: string,
    @Args('photos', { type: () => [String], nullable: true }) photos?: string[],
  ) {
    return this.disputesService.reportIssue(user.userId, redemptionId, type, description, photos);
  }
}
