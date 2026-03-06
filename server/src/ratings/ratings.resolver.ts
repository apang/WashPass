import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service.js';
import { RatingModel } from './models/rating.model.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '@prisma/client';

@Resolver(() => RatingModel)
export class RatingsResolver {
  constructor(private ratingsService: RatingsService) {}

  @Mutation(() => RatingModel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async submitRating(
    @CurrentUser() user: any,
    @Args('redemptionId') redemptionId: string,
    @Args('stars', { type: () => Int }) stars: number,
    @Args('text', { nullable: true }) text?: string,
  ) {
    return this.ratingsService.submitRating(user.userId, redemptionId, stars, text);
  }
}
