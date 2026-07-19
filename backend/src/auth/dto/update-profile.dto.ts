import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsTimeZone,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { HeightUnit, WeightUnit } from '../../users/schemas/user.schema';
import {
  ActivityLevel,
  FormulaSex,
  GoalType,
  MacroRatioKey,
} from '../../goals/goals.types';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(13)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20)
  @Max(700)
  weight?: number;

  @IsOptional()
  @IsEnum(WeightUnit)
  weight_unit?: WeightUnit;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(300)
  height?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(11.99)
  height_inches?: number;

  @IsOptional()
  @IsEnum(HeightUnit)
  height_unit?: HeightUnit;

  @IsOptional()
  @IsInt()
  @Min(500)
  @Max(10_000)
  target_calories?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  target_protein?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1500)
  target_carbs?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  target_fat?: number;

  @IsOptional()
  @IsTimeZone()
  @MaxLength(100)
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  clear_goal?: boolean;

  @IsOptional()
  @IsEnum(GoalType)
  goal_type?: GoalType;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20)
  @Max(700)
  target_weight?: number;

  @IsOptional()
  @IsEnum(WeightUnit)
  target_weight_unit?: WeightUnit;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(260)
  duration_weeks?: number;

  @IsOptional()
  @IsEnum(ActivityLevel)
  activity_level?: ActivityLevel;

  @IsOptional()
  @IsEnum(FormulaSex)
  formula_sex?: FormulaSex;

  @IsOptional()
  @IsEnum(MacroRatioKey)
  macro_ratio?: MacroRatioKey;
}
