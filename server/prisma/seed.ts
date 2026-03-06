import { PrismaClient, PlanTier, BillingCycle } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      tier: PlanTier.BASIC,
      cycle: BillingCycle.MONTHLY,
      name: 'Basic Monthly',
      priceMonthly: 2199,
      washesPerMonth: 4,
      geoZone: 'zone_2',
    },
    {
      tier: PlanTier.BASIC,
      cycle: BillingCycle.ANNUAL,
      name: 'Basic Annual',
      priceMonthly: 1869, // 15% discount
      washesPerMonth: 4,
      geoZone: 'zone_2',
    },
    {
      tier: PlanTier.PLUS,
      cycle: BillingCycle.MONTHLY,
      name: 'Plus Monthly',
      priceMonthly: 3199,
      washesPerMonth: 8,
      geoZone: 'zone_2',
    },
    {
      tier: PlanTier.PLUS,
      cycle: BillingCycle.ANNUAL,
      name: 'Plus Annual',
      priceMonthly: 2719, // 15% discount
      washesPerMonth: 8,
      geoZone: 'zone_2',
    },
    {
      tier: PlanTier.PREMIUM,
      cycle: BillingCycle.MONTHLY,
      name: 'Premium Monthly',
      priceMonthly: 4199,
      washesPerMonth: 12,
      geoZone: 'zone_2',
    },
    {
      tier: PlanTier.PREMIUM,
      cycle: BillingCycle.ANNUAL,
      name: 'Premium Annual',
      priceMonthly: 3569, // 15% discount
      washesPerMonth: 12,
      geoZone: 'zone_2',
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: {
        tier_cycle_geoZone: {
          tier: plan.tier,
          cycle: plan.cycle,
          geoZone: plan.geoZone,
        },
      },
      update: plan,
      create: plan,
    });
  }

  console.log(`Seeded ${plans.length} plans`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
