import { Module, forwardRef } from '@nestjs/common';
import { MembershipsService } from './memberships.service.js';
import { MembershipsResolver } from './memberships.resolver.js';
import { StripeModule } from '../stripe/stripe.module.js';

@Module({
  imports: [forwardRef(() => StripeModule)],
  providers: [MembershipsService, MembershipsResolver],
  exports: [MembershipsService],
})
export class MembershipsModule {}
