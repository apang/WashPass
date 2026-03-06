import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  name!: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  zipCode!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsOptional()
  washTypes?: any;

  @IsOptional()
  hours?: any;

  @IsArray()
  @IsOptional()
  photos?: string[];
}
