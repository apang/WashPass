import { Module, forwardRef } from '@nestjs/common';
import { StripeService } from './stripe.service.js';
import { StripeWebhookController } from './stripe-webhook.controller.js';
import { MembershipsModule } from '../memberships/memberships.module.js';

@Module({
  imports: [forwardRef(() => MembershipsModule)],
  controllers: [StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
