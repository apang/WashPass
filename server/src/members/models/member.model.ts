import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class MemberModel {
  @Field(() => ID)
  id!: string;

  @Field()
  fullName!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  email!: string;

  @Field()
  createdAt!: Date;
}
