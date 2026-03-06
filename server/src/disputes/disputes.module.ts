import { Module } from '@nestjs/common';
import { DisputesService } from './disputes.service.js';
import { DisputesResolver } from './disputes.resolver.js';
import { DisputesController } from './disputes.controller.js';

@Module({
  controllers: [DisputesController],
  providers: [DisputesService, DisputesResolver],
  exports: [DisputesService],
})
export class DisputesModule {}
