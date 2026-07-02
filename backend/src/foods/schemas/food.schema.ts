import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class Vitamins {
  @Prop({ required: true, min: 0 }) b1: number;
  @Prop({ required: true, min: 0 }) b2: number;
  @Prop({ required: true, min: 0 }) b3: number;
  @Prop({ required: true, min: 0 }) b5: number;
  @Prop({ required: true, min: 0 }) b6: number;
  @Prop({ required: true, min: 0 }) b7: number;
  @Prop({ required: true, min: 0 }) b8: number;
  @Prop({ required: true, min: 0 }) b9: number;
  @Prop({ required: true, min: 0 }) b12: number;
  @Prop({ required: true, min: 0 }) a: number;
  @Prop({ required: true, min: 0 }) c: number;
  @Prop({ required: true, min: 0 }) d: number;
  @Prop({ required: true, min: 0 }) e: number;
  @Prop({ required: true, min: 0 }) k: number;
}

const VitaminsSchema = SchemaFactory.createForClass(Vitamins);

@Schema({ _id: false })
export class Minerals {
  @Prop({ required: true, min: 0 }) calcium: number;
  @Prop({ required: true, min: 0 }) copper: number;
  @Prop({ required: true, min: 0 }) iron: number;
  @Prop({ required: true, min: 0 }) magnesium: number;
  @Prop({ required: true, min: 0 }) manganese: number;
  @Prop({ required: true, min: 0 }) phosphorus: number;
  @Prop({ required: true, min: 0 }) potassium: number;
  @Prop({ required: true, min: 0 }) selenium: number;
  @Prop({ required: true, min: 0 }) sodium: number;
  @Prop({ required: true, min: 0 }) zinc: number;
}

const MineralsSchema = SchemaFactory.createForClass(Minerals);

@Schema({ _id: false })
export class Nutrition {
  @Prop({ required: true, min: 0 }) calories: number;
  @Prop({ required: true, min: 0 }) protein: number;
  @Prop({ required: true, min: 0 }) carbs: number;
  @Prop({ required: true, min: 0 }) fats: number;
  @Prop({ type: VitaminsSchema }) vitamins?: Vitamins;
  @Prop({ type: MineralsSchema }) minerals?: Minerals;
}

const NutritionSchema = SchemaFactory.createForClass(Nutrition);

@Schema({ timestamps: true, versionKey: false, collection: 'foods' })
export class Food {
  @Prop({ required: true, trim: true, minlength: 1, maxlength: 160, index: true })
  name: string;

  @Prop({ required: true, trim: true, index: true })
  addedBy: string;

  @Prop({ required: true, default: 0, min: 0 })
  selectedBy: number;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 30 })
  unit: string;

  @Prop({ required: true, type: NutritionSchema })
  nutrition: Nutrition;

  @Prop({ required: true, default: false, index: true })
  approved: boolean;
}

export type FoodDocument = HydratedDocument<Food>;
export const FoodSchema = SchemaFactory.createForClass(Food);
FoodSchema.index({ approved: 1, name: 1 });
FoodSchema.index({ addedBy: 1, approved: 1 });
