import {
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StripeService } from '../stripe/stripe.service.js';
import { MembershipStatus } from '@prisma/client';

@Injectable()
export class MembershipsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => StripeService))
    private stripeService: StripeService,
  ) {}

  async subscribe(userId: string, planId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: { membership: true },
    });
    if (!member) throw new NotFoundException('Member not found');
    if (member.membership) throw new BadRequestException('Already subscribed');

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) throw new NotFoundException('Plan not found');

    if (!plan.stripePriceId) {
      throw new BadRequestException('Plan not configured for billing');
    }

    // Create or get Stripe customer
    let customerId = member.stripeCustomerId;
    if (!customerId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const customer = await this.stripeService.createCustomer(
        user!.email,
        member.fullName,
      );
      customerId = customer.id;
      await this.prisma.member.update({
        where: { id: member.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const session = await this.stripeService.createCheckoutSession({
      customerId,
      priceId: plan.stripePriceId,
      successUrl: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${frontendUrl}/subscription/cancel`,
    });

    return { checkoutUrl: session.url, sessionId: session.id };
  }

  async handleCheckoutComplete(session: any) {
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    const member = await this.prisma.member.findFirst({
      where: { stripeCustomerId: customerId },
    });
    if (!member) return;

    // Find plan by stripe price
    const planId = session.metadata?.planId;
    const plan = planId
      ? await this.prisma.plan.findUnique({ where: { id: planId } })
      : await this.prisma.plan.findFirst({ where: { isActive: true } });
    if (!plan) return;

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await this.prisma.membership.upsert({
      where: { memberId: member.id },
      create: {
        memberId: member.id,
        planId: plan.id,
        status: MembershipStatus.ACTIVE,
        stripeSubId: subscriptionId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        washesRemaining: plan.washesPerMonth,
      },
      update: {
        planId: plan.id,
        status: MembershipStatus.ACTIVE,
        stripeSubId: subscriptionId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        washesRemaining: plan.washesPerMonth,
      },
    });
  }

  async handleInvoicePaid(invoice: any) {
    const subId = invoice.subscription;
    const membership = await this.prisma.membership.findFirst({
      where: { stripeSubId: subId },
      include: { plan: true },
    });
    if (!membership) return;

    await this.prisma.membership.update({
      where: { id: membership.id },
      data: {
        status: MembershipStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        washesRemaining: membership.plan.washesPerMonth + Math.min(membership.rolloverWashes, membership.plan.washesPerMonth),
        rolloverWashes: membership.washesRemaining,
      },
    });
  }

  async handlePaymentFailed(invoice: any) {
    const subId = invoice.subscription;
    await this.prisma.membership.updateMany({
      where: { stripeSubId: subId },
      data: { status: MembershipStatus.PAYMENT_PENDING },
    });
  }

  async handleSubscriptionUpdated(sub: any) {
    await this.prisma.membership.updateMany({
      where: { stripeSubId: sub.id },
      data: {
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
      },
    });
  }

  async handleSubscriptionDeleted(sub: any) {
    await this.prisma.membership.updateMany({
      where: { stripeSubId: sub.id },
      data: { status: MembershipStatus.CANCELLED, cancelledAt: new Date() },
    });
  }

  async pause(userId: string, durationDays: number = 30) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: { membership: true },
    });
    if (!member?.membership) throw new NotFoundException('No membership');
    if (member.membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestException('Can only pause active membership');
    }

    if (member.membership.stripeSubId) {
      await this.stripeService.pauseSubscription(member.membership.stripeSubId);
    }

    const pausedUntil = new Date();
    pausedUntil.setDate(pausedUntil.getDate() + Math.min(durationDays, 30));

    return this.prisma.membership.update({
      where: { id: member.membership.id },
      data: { status: MembershipStatus.PAUSED, pausedUntil },
    });
  }

  async resume(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: { membership: true },
    });
    if (!member?.membership) throw new NotFoundException('No membership');
    if (member.membership.status !== MembershipStatus.PAUSED) {
      throw new BadRequestException('Membership not paused');
    }

    if (member.membership.stripeSubId) {
      await this.stripeService.resumeSubscription(member.membership.stripeSubId);
    }

    return this.prisma.membership.update({
      where: { id: member.membership.id },
      data: { status: MembershipStatus.ACTIVE, pausedUntil: null },
    });
  }

  async cancel(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: { membership: true },
    });
    if (!member?.membership) throw new NotFoundException('No membership');

    if (member.membership.stripeSubId) {
      await this.stripeService.cancelSubscription(member.membership.stripeSubId);
    }

    return this.prisma.membership.update({
      where: { id: member.membership.id },
      data: { status: MembershipStatus.CANCELLED, cancelledAt: new Date() },
    });
  }

  async getMembership(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: { membership: { include: { plan: true } } },
    });
    if (!member?.membership) return null;

    const m = member.membership;
    return {
      id: m.id,
      status: m.status,
      planTier: m.plan.tier,
      planCycle: m.plan.cycle,
      planName: m.plan.name,
      washesRemaining: m.washesRemaining,
      rolloverWashes: m.rolloverWashes,
      currentPeriodEnd: m.currentPeriodEnd,
      pausedUntil: m.pausedUntil,
      cancelledAt: m.cancelledAt,
    };
  }
}
