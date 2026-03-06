import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class DisputeModel {
  @Field(() => ID)
  id!: string;

  @Field()
  status!: string;

  @Field()
  type!: string;

  @Field()
  description!: string;

  @Field(() => [String], { nullable: true })
  photos?: string[];

  @Field({ nullable: true })
  resolution?: string;

  @Field()
  createdAt!: Date;
}
