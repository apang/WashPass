import { IsEnum } from 'class-validator';
import { LocationStatus } from '@prisma/client';

export class UpdateLocationStatusDto {
  @IsEnum(LocationStatus)
  status!: LocationStatus;
}
