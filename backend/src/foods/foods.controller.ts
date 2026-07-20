import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';
import { CustomFoodsService } from '../custom-foods/custom-foods.service';
import { CreateRecipeDto } from '../custom-foods/dto/create-recipe.dto';
import { CreateFoodDto } from './dto/create-food.dto';
import { FoodsService } from './foods.service';

@Controller('foods')
export class FoodsController {
  constructor(
    private readonly foodsService: FoodsService,
    private readonly customFoodsService: CustomFoodsService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findVisible(@CurrentUser() user?: AuthenticatedUser) {
    return this.foodsService.findVisible(user?.id);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findPending() {
    return this.foodsService.findPending();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateFoodDto) {
    return this.customFoodsService.createFood(user.id, dto);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  approve(@Param('id') id: string) {
    return this.foodsService.approve(id);
  }

  @Patch(':id/cancel-approval')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  cancelApproval(@Param('id') id: string) {
    return this.foodsService.cancelApproval(id);
  }

  @Patch(':id/food')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateFood(@Param('id') id: string, @Body() dto: CreateFoodDto) {
    return this.customFoodsService.updateFood(id, dto);
  }

  @Patch(':id/recipe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateRecipe(@Param('id') id: string, @Body() dto: CreateRecipeDto) {
    return this.customFoodsService.updateRecipe(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.foodsService.remove(id, user);
  }
}
