import { Module } from '@nestjs/common';
import { PlansService } from './plans.service.js';
import { PlansResolver } from './plans.resolver.js';

@Module({
  providers: [PlansService, PlansResolver],
  exports: [PlansService],
})
export class PlansModule {}
