import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ActivityDateQueryDto } from '../meal-activities/dto/activity-date-query.dto';
import { UserRole } from '../users/schemas/user.schema';
import { DietChartExportService } from './diet-chart-export.service';

@Controller('diet-chart-exports')
@UseGuards(JwtAuthGuard)
export class DietChartExportController {
  constructor(private readonly exports: DietChartExportService) {}

  @Post('requests')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  requestChart(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ActivityDateQueryDto,
  ) {
    return this.exports.requestChart(user.id, query.date);
  }

  @Get('requests')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  listRequests() {
    return this.exports.listPendingRequests();
  }

  @Patch('requests/:requestId/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  approveRequest(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('requestId') requestId: string,
  ) {
    return this.exports.approveRequest(requestId, admin.id);
  }
}
