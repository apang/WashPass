import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('stripe.secretKey') || '',
      { apiVersion: '2024-04-10' as any },
    );
  }

  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({ email, name });
  }

  async createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      customer: params.customerId,
      payment_method_types: ['card'],
      line_items: [{ price: params.priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });
  }

  async cancelSubscription(subId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(subId, {
      cancel_at_period_end: true,
    });
  }

  async pauseSubscription(subId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(subId, {
      pause_collection: { behavior: 'void' },
    });
  }

  async resumeSubscription(subId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(subId, {
      pause_collection: '',
    } as any);
  }

  async updateSubscription(subId: string, priceId: string): Promise<Stripe.Subscription> {
    const sub = await this.stripe.subscriptions.retrieve(subId);
    return this.stripe.subscriptions.update(subId, {
      items: [{ id: sub.items.data[0].id, price: priceId }],
      proration_behavior: 'create_prorations',
    });
  }

  constructWebhookEvent(body: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret') || '';
    return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }
}
