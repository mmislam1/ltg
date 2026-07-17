import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Food } from '../../foods/schemas/food.schema';
import { User } from '../../users/schemas/user.schema';

export enum MealType {
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
  SNACK = 'Snack',
}

@Schema({ _id: false })
export class MealItem {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: Food.name })
  foodId: Types.ObjectId;

  @Prop({ required: true, min: 0.001, max: 1_000_000 })
  quantity: number;
}

const MealItemSchema = SchemaFactory.createForClass(MealItem);

@Schema({ _id: false })
export class Meal {
  @Prop({ required: true, enum: MealType })
  mealType: MealType;

  @Prop({ required: true, type: [MealItemSchema], default: [] })
  list: MealItem[];
}

const MealSchema = SchemaFactory.createForClass(Meal);

@Schema({ timestamps: true, versionKey: false, collection: 'meal_activities' })
export class MealActivity {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: User.name })
  userId: Types.ObjectId;

  @Prop({ required: true, match: /^\d{4}-\d{2}-\d{2}$/ })
  date: string;

  @Prop({ required: true, trim: true })
  timezone: string;

  @Prop({ required: true, min: 0, max: 100, default: 0 })
  water: number;

  @Prop({ required: true, min: 0, max: 250_000, default: 0 })
  steps: number;

  @Prop({ required: true, type: [MealSchema], default: [] })
  meals: Meal[];
}

export type MealActivityDocument = HydratedDocument<MealActivity>;
export const MealActivitySchema = SchemaFactory.createForClass(MealActivity);
MealActivitySchema.index({ userId: 1, date: 1 }, { unique: true });
