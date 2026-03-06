import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MembershipResetJob } from './membership-reset.job.js';
import { PauseResumeJob } from './pause-resume.job.js';
import { ExpiredCodesJob } from './expired-codes.job.js';
import { PayoutCalculationJob } from './payout-calculation.job.js';
import { PayoutsModule } from '../payouts/payouts.module.js';

@Module({
  imports: [ScheduleModule.forRoot(), PayoutsModule],
  providers: [MembershipResetJob, PauseResumeJob, ExpiredCodesJob, PayoutCalculationJob],
})
export class JobsModule {}
