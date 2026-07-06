import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Food, FoodSchema } from '../foods/schemas/food.schema';
import { MealActivitiesModule } from '../meal-activities/meal-activities.module';
import { UsersModule } from '../users/users.module';
import { DietChartExportController } from './diet-chart-export.controller';
import { DietChartExportService } from './diet-chart-export.service';
import { DietChartMailService } from './diet-chart-mail.service';
import { DietChartPdfService } from './diet-chart-pdf.service';
import {
  DietChartExportRequest,
  DietChartExportRequestSchema,
} from './schemas/diet-chart-export-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Food.name, schema: FoodSchema },
      { name: DietChartExportRequest.name, schema: DietChartExportRequestSchema },
    ]),
    AuthModule,
    MealActivitiesModule,
    UsersModule,
  ],
  controllers: [DietChartExportController],
  providers: [DietChartExportService, DietChartPdfService, DietChartMailService],
})
export class DietChartExportModule {}
