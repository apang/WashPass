import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class MembershipModel {
  @Field(() => ID)
  id!: string;

  @Field()
  status!: string;

  @Field()
  planTier!: string;

  @Field()
  planCycle!: string;

  @Field()
  planName!: string;

  @Field(() => Int)
  washesRemaining!: number;

  @Field(() => Int)
  rolloverWashes!: number;

  @Field({ nullable: true })
  currentPeriodEnd?: Date;

  @Field({ nullable: true })
  pausedUntil?: Date;

  @Field({ nullable: true })
  cancelledAt?: Date;
}
