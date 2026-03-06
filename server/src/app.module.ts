import { Module } from '@nestjs/common';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppConfigModule } from './config/config.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RedisModule } from './redis/redis.module.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { MembersModule } from './members/members.module.js';
import { VehiclesModule } from './vehicles/vehicles.module.js';
import { PlansModule } from './plans/plans.module.js';
import { LocationsModule } from './locations/locations.module.js';
import { StripeModule } from './stripe/stripe.module.js';
import { MembershipsModule } from './memberships/memberships.module.js';
import { RedemptionsModule } from './redemptions/redemptions.module.js';
import { RatingsModule } from './ratings/ratings.module.js';
import { DisputesModule } from './disputes/disputes.module.js';
import { PayoutsModule } from './payouts/payouts.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { OperatorStaffModule } from './operator-staff/operator-staff.module.js';
import { JobsModule } from './jobs/jobs.module.js';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    RedisModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req }: { req: any }) => ({ req }),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 100,
      },
    ]),
    HealthModule,
    AuthModule,
    MembersModule,
    VehiclesModule,
    PlansModule,
    LocationsModule,
    StripeModule,
    MembershipsModule,
    RedemptionsModule,
    RatingsModule,
    DisputesModule,
    PayoutsModule,
    AnalyticsModule,
    OperatorStaffModule,
    JobsModule,
  ],
})
export class AppModule {}
