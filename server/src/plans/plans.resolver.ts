import { Resolver, Query, Args } from '@nestjs/graphql';
import { PlansService } from './plans.service.js';
import { PlanModel } from './models/plan.model.js';

@Resolver(() => PlanModel)
export class PlansResolver {
  constructor(private plansService: PlansService) {}

  @Query(() => [PlanModel])
  async plans(@Args('geoZone', { nullable: true }) geoZone?: string) {
    return this.plansService.findAll(geoZone);
  }

  @Query(() => PlanModel)
  async plan(@Args('id') id: string) {
    return this.plansService.findById(id);
  }
}
