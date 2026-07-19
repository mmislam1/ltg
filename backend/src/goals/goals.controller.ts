import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GoalPreviewDto } from './dto/goal-preview.dto';
import { GoalsService } from './goals.service';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get('options')
  options() {
    return this.goalsService.options();
  }

  @Post('preview')
  @UseGuards(JwtAuthGuard)
  preview(@CurrentUser() _user: { id: string }, @Body() dto: GoalPreviewDto) {
    return this.goalsService.preview(dto);
  }
}
