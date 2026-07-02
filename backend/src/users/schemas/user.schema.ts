import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum WeightUnit {
  KG = 'kg',
  LB = 'lb',
}

export enum HeightUnit {
  CM = 'cm',
  FT = 'ft',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema({ timestamps: true, versionKey: false, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, min: 13, max: 120 })
  age: number;

  @Prop({ required: true, min: 20, max: 700 })
  weight: number;

  @Prop({ required: true, enum: WeightUnit, default: WeightUnit.KG })
  weightUnit: WeightUnit;

  @Prop({ required: true, min: 1, max: 300 })
  height: number;

  @Prop({ required: true, enum: HeightUnit, default: HeightUnit.CM })
  heightUnit: HeightUnit;

  @Prop({ default: 2000, min: 500, max: 10_000 })
  targetCalories: number;

  @Prop({ default: 120, min: 0, max: 1000 })
  targetProtein: number;

  @Prop({ default: 220, min: 0, max: 1500 })
  targetCarbs: number;

  @Prop({ default: 65, min: 0, max: 1000 })
  targetFat: number;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: String, default: null, select: false })
  refreshTokenHash?: string | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true, enum: UserRole, default: UserRole.USER, index: true })
  role: UserRole;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
