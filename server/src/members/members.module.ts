import { Module } from '@nestjs/common';
import { MembersService } from './members.service.js';
import { MembersResolver } from './members.resolver.js';

@Module({
  providers: [MembersService, MembersResolver],
  exports: [MembersService],
})
export class MembersModule {}
