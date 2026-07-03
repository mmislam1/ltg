import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Food, FoodSchema } from '../foods/schemas/food.schema';
import { UsersModule } from '../users/users.module';
import { MealActivitiesController } from './meal-activities.controller';
import { MealActivitiesService } from './meal-activities.service';
import {
  MealActivity,
  MealActivitySchema,
} from './schemas/meal-activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MealActivity.name, schema: MealActivitySchema },
      { name: Food.name, schema: FoodSchema },
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [MealActivitiesController],
  providers: [MealActivitiesService],
})
export class MealActivitiesModule {}
