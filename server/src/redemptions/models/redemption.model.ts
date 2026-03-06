import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class RedemptionModel {
  @Field(() => ID)
  id!: string;

  @Field()
  code!: string;

  @Field()
  numericCode!: string;

  @Field()
  status!: string;

  @Field({ nullable: true })
  qrDataUrl?: string;

  @Field(() => Int, { nullable: true })
  upgradeAmount?: number;

  @Field({ nullable: true })
  validatedAt?: Date;

  @Field()
  expiresAt!: Date;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  locationName?: string;
}

@ObjectType()
export class RedemptionCodeResult {
  @Field()
  code!: string;

  @Field()
  numericCode!: string;

  @Field()
  qrDataUrl!: string;

  @Field()
  expiresAt!: Date;
}

@ObjectType()
export class WashHistoryResult {
  @Field(() => [RedemptionModel])
  items!: RedemptionModel[];

  @Field()
  hasMore!: boolean;

  @Field({ nullable: true })
  nextCursor?: string;
}

@ObjectType()
export class ValidateCodeResult {
  @Field()
  valid!: boolean;

  @Field({ nullable: true })
  memberName?: string;

  @Field({ nullable: true })
  planTier?: string;

  @Field({ nullable: true })
  redemptionId?: string;
}
