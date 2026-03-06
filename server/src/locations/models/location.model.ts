import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class LocationModel {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  address!: string;

  @Field()
  city!: string;

  @Field()
  state!: string;

  @Field()
  zipCode!: string;

  @Field(() => Float)
  latitude!: number;

  @Field(() => Float)
  longitude!: number;

  @Field()
  status!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => [String], { nullable: true })
  photos?: string[];

  @Field(() => Float)
  avgRating!: number;

  @Field(() => Int)
  totalRatings!: number;

  @Field(() => Float, { nullable: true })
  distance?: number;
}
