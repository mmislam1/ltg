import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFoodDto } from '../foods/dto/create-food.dto';
import { CustomFoodsService } from './custom-foods.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';

@Controller('custom')
@UseGuards(JwtAuthGuard)
export class CustomFoodsController {
  constructor(private readonly customFoodsService: CustomFoodsService) {}

  @Post('foods')
  createFood(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateFoodDto) {
    return this.customFoodsService.createFood(user.id, dto);
  }

  @Post('recipes')
  createRecipe(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateRecipeDto) {
    return this.customFoodsService.createRecipe(user.id, dto);
  }
}
