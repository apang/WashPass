import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service.js';
import { RatingsResolver } from './ratings.resolver.js';

@Module({
  providers: [RatingsService, RatingsResolver],
  exports: [RatingsService],
})
export class RatingsModule {}
