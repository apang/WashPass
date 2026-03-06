import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

@InputType()
export class CreateVehicleInput {
  @Field()
  @IsString()
  make!: string;

  @Field()
  @IsString()
  model!: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  year?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  color?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  licensePlate?: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
