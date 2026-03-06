import { Resolver, Query, Args, Float, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service.js';
import { LocationModel } from './models/location.model.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class NearbyLocationsResult {
  @Field(() => [LocationModel])
  locations!: LocationModel[];

  @Field()
  hasMore!: boolean;

  @Field({ nullable: true })
  nextCursor?: string;
}

@Resolver(() => LocationModel)
export class LocationsResolver {
  constructor(private locationsService: LocationsService) {}

  @Query(() => NearbyLocationsResult)
  @UseGuards(JwtAuthGuard)
  async nearbyLocations(
    @Args('lat', { type: () => Float }) lat: number,
    @Args('lng', { type: () => Float }) lng: number,
    @Args('radius', { type: () => Float, nullable: true, defaultValue: 25 }) radius: number,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 25 }) limit?: number,
  ) {
    return this.locationsService.findNearby(lat, lng, radius, cursor, limit);
  }

  @Query(() => LocationModel)
  @UseGuards(JwtAuthGuard)
  async location(@Args('id') id: string) {
    return this.locationsService.findById(id);
  }
}
