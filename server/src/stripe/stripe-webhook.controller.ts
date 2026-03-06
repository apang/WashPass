import {
  Controller,
  Post,
  Headers,
  RawBody,
  BadRequestException,
} from '@nestjs/common';
import { StripeService } from './stripe.service.js';
import { MembershipsService } from '../memberships/memberships.service.js';

@Controller('webhooks')
export class StripeWebhookController {
  constructor(
    private stripeService: StripeService,
    private membershipsService: MembershipsService,
  ) {}

  @Post('stripe')
  async handleWebhook(
    @RawBody() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    let event;
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        await this.membershipsService.handleCheckoutComplete(session);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as any;
        await this.membershipsService.handleInvoicePaid(invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        await this.membershipsService.handlePaymentFailed(invoice);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        await this.membershipsService.handleSubscriptionUpdated(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        await this.membershipsService.handleSubscriptionDeleted(sub);
        break;
      }
    }

    return { received: true };
  }
}
