import { Module } from '@nestjs/common';
import { OperatorStaffService } from './operator-staff.service.js';
import { OperatorStaffController } from './operator-staff.controller.js';

@Module({
  controllers: [OperatorStaffController],
  providers: [OperatorStaffService],
  exports: [OperatorStaffService],
})
export class OperatorStaffModule {}
