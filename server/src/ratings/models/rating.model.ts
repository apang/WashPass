import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class RatingModel {
  @Field(() => ID)
  id!: string;

  @Field(() => Int)
  stars!: number;

  @Field({ nullable: true })
  text?: string;

  @Field()
  createdAt!: Date;
}
