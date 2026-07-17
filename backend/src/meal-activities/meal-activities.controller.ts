import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityDateQueryDto } from './dto/activity-date-query.dto';
import { UpdateDailyActivityDto } from './dto/daily-activity.dto';
import { AddMealDto, UpdateMealDto } from './dto/meal.dto';
import { MealActivitiesService } from './meal-activities.service';
import { MealType } from './schemas/meal-activity.schema';

@Controller('meal-activities')
@UseGuards(JwtAuthGuard)
export class MealActivitiesController {
  constructor(private readonly mealActivities: MealActivitiesService) {}

  @Get()
  findForDate(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ActivityDateQueryDto,
  ) {
    return this.mealActivities.findForDate(user.id, query.date);
  }

  @Post('meals')
  addMeal(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ActivityDateQueryDto,
    @Body() dto: AddMealDto,
  ) {
    return this.mealActivities.addMeal(user.id, dto, query.date);
  }

  @Post('copy-to-today')
  @HttpCode(HttpStatus.OK)
  copyToToday(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ActivityDateQueryDto,
  ) {
    return this.mealActivities.copyToToday(user.id, query.date);
  }

  @Patch('daily')
  @HttpCode(HttpStatus.OK)
  updateDailyActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ActivityDateQueryDto,
    @Body() dto: UpdateDailyActivityDto,
  ) {
    return this.mealActivities.updateDailyActivity(user.id, dto, query.date);
  }

  @Patch('meals/:mealType')
  @HttpCode(HttpStatus.OK)
  updateMeal(
    @CurrentUser() user: AuthenticatedUser,
    @Param('mealType', new ParseEnumPipe(MealType)) mealType: MealType,
    @Query() query: ActivityDateQueryDto,
    @Body() dto: UpdateMealDto,
  ) {
    return this.mealActivities.updateMeal(user.id, mealType, dto, query.date);
  }
}
