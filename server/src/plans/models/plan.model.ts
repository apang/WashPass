import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class PlanModel {
  @Field(() => ID)
  id!: string;

  @Field()
  tier!: string;

  @Field()
  cycle!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  priceMonthly!: number;

  @Field(() => Int)
  washesPerMonth!: number;

  @Field()
  geoZone!: string;

  @Field()
  isActive!: boolean;
}
