import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { VehiclesService } from './vehicles.service.js';
import { VehicleModel } from './models/vehicle.model.js';
import { CreateVehicleInput } from './dto/create-vehicle.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '@prisma/client';

@Resolver(() => VehicleModel)
export class VehiclesResolver {
  constructor(private vehiclesService: VehiclesService) {}

  @Query(() => [VehicleModel])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async myVehicles(@CurrentUser() user: any) {
    return this.vehiclesService.findAllByMember(user.userId);
  }

  @Mutation(() => VehicleModel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async addVehicle(
    @CurrentUser() user: any,
    @Args('input') input: CreateVehicleInput,
  ) {
    return this.vehiclesService.create(user.userId, input);
  }

  @Mutation(() => VehicleModel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async removeVehicle(
    @CurrentUser() user: any,
    @Args('vehicleId') vehicleId: string,
  ) {
    return this.vehiclesService.remove(user.userId, vehicleId);
  }

  @Mutation(() => VehicleModel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  async setDefaultVehicle(
    @CurrentUser() user: any,
    @Args('vehicleId') vehicleId: string,
  ) {
    return this.vehiclesService.setDefault(user.userId, vehicleId);
  }
}
