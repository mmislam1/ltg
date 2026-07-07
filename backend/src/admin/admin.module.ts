import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import {
  DietChartExportRequest,
  DietChartExportRequestSchema,
} from '../diet-chart-export/schemas/diet-chart-export-request.schema';
import { Food, FoodSchema } from '../foods/schemas/food.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Food.name, schema: FoodSchema },
      { name: DietChartExportRequest.name, schema: DietChartExportRequestSchema },
    ]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
