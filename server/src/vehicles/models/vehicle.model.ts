import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class VehicleModel {
  @Field(() => ID)
  id!: string;

  @Field()
  make!: string;

  @Field()
  model!: string;

  @Field(() => Int, { nullable: true })
  year?: number;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  licensePlate?: string;

  @Field()
  isDefault!: boolean;
}
