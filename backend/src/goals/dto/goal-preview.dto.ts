import { IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { HeightUnit, WeightUnit } from '../../users/schemas/user.schema';
import {
  ActivityLevel,
  FormulaSex,
  GoalType,
  MacroRatioKey,
} from '../goals.types';

export class GoalPreviewDto {
  @IsInt()
  @Min(13)
  @Max(120)
  age: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20)
  @Max(700)
  weight: number;

  @IsEnum(WeightUnit)
  weight_unit: WeightUnit;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(300)
  height: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(11.99)
  height_inches?: number;

  @IsEnum(HeightUnit)
  height_unit: HeightUnit;

  @IsEnum(GoalType)
  goal_type: GoalType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20)
  @Max(700)
  target_weight: number;

  @IsEnum(WeightUnit)
  target_weight_unit: WeightUnit;

  @IsInt()
  @Min(1)
  @Max(260)
  duration_weeks: number;

  @IsEnum(ActivityLevel)
  activity_level: ActivityLevel;

  @IsEnum(FormulaSex)
  formula_sex: FormulaSex;

  @IsEnum(MacroRatioKey)
  macro_ratio: MacroRatioKey;
}
