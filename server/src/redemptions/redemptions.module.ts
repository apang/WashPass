import { Module } from '@nestjs/common';
import { RedemptionsService } from './redemptions.service.js';
import { RedemptionsResolver } from './redemptions.resolver.js';
import { RedemptionsController } from './redemptions.controller.js';

@Module({
  controllers: [RedemptionsController],
  providers: [RedemptionsService, RedemptionsResolver],
  exports: [RedemptionsService],
})
export class RedemptionsModule {}
