import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OperatorStaffService } from './operator-staff.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '@prisma/client';

@Controller('v1/staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OPERATOR_ADMIN)
export class OperatorStaffController {
  constructor(private staffService: OperatorStaffService) {}

  @Post()
  async addStaff(
    @Request() req: any,
    @Body() body: { email: string; password: string; fullName: string },
  ) {
    return this.staffService.addStaff(req.user.userId, body.email, body.password, body.fullName);
  }

  @Delete(':id')
  async removeStaff(@Request() req: any, @Param('id') id: string) {
    return this.staffService.removeStaff(req.user.userId, id);
  }

  @Get()
  async listStaff(@Request() req: any) {
    return this.staffService.listStaff(req.user.userId);
  }

  @Patch(':id/role')
  async changeRole(
    @Request() req: any,
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ) {
    return this.staffService.changeRole(req.user.userId, id, role);
  }
}
