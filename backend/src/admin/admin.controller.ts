import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { AdminService } from './admin.service';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.dashboard();
  }

  @Patch('members/:memberId/purchase')
  updatePurchase(
    @Param('memberId') memberId: string,
    @Body() dto: UpdatePurchaseDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.admin.setPurchased(memberId, dto.purchased, admin.id);
  }
}
