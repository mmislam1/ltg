import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Food, FoodSchema } from '../foods/schemas/food.schema';
import { CustomFoodsController } from './custom-foods.controller';
import { CustomFoodsService } from './custom-foods.service';
import { NutritionLabelScannerService } from './nutrition-label-scanner.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Food.name, schema: FoodSchema }]),
    AuthModule,
  ],
  controllers: [CustomFoodsController],
  providers: [CustomFoodsService, NutritionLabelScannerService],
  exports: [CustomFoodsService],
})
export class CustomFoodsModule {}
