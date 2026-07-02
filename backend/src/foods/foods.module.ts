import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { FoodsController } from './foods.controller';
import { FoodsService } from './foods.service';
import { Food, FoodSchema } from './schemas/food.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Food.name, schema: FoodSchema }]),
    AuthModule,
  ],
  controllers: [FoodsController],
  providers: [FoodsService],
})
export class FoodsModule {}
