import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFoodDto } from '../foods/dto/create-food.dto';
import { CustomFoodsService } from './custom-foods.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { NutritionLabelScannerService } from './nutrition-label-scanner.service';

interface UploadedNutritionImage {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

@Controller('custom')
@UseGuards(JwtAuthGuard)
export class CustomFoodsController {
  constructor(
    private readonly customFoodsService: CustomFoodsService,
    private readonly nutritionLabelScanner: NutritionLabelScannerService,
  ) {}

  @Post('foods')
  createFood(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateFoodDto) {
    return this.customFoodsService.createFood(user.id, dto);
  }

  @Post('foods/scan-label')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 8 * 1024 * 1024 } }))
  scanNutritionLabel(@UploadedFile() image?: UploadedNutritionImage) {
    return this.nutritionLabelScanner.scan(image);
  }

  @Post('recipes')
  createRecipe(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateRecipeDto) {
    return this.customFoodsService.createRecipe(user.id, dto);
  }
}
