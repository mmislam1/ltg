import { Type, Transform } from 'class-transformer';
import {
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { FoodUnit } from '../schemas/food.schema';

const nutrient = () => IsNumber({ maxDecimalPlaces: 4 });

export class VitaminsDto {
  @nutrient() @Min(0) b1: number;
  @nutrient() @Min(0) b2: number;
  @nutrient() @Min(0) b3: number;
  @nutrient() @Min(0) b5: number;
  @nutrient() @Min(0) b6: number;
  @nutrient() @Min(0) b7: number;
  @nutrient() @Min(0) b8: number;
  @nutrient() @Min(0) b9: number;
  @nutrient() @Min(0) b12: number;
  @nutrient() @Min(0) a: number;
  @nutrient() @Min(0) c: number;
  @nutrient() @Min(0) d: number;
  @nutrient() @Min(0) e: number;
  @nutrient() @Min(0) k: number;
}

export class MineralsDto {
  @nutrient() @Min(0) calcium: number;
  @nutrient() @Min(0) copper: number;
  @nutrient() @Min(0) iron: number;
  @nutrient() @Min(0) magnesium: number;
  @nutrient() @Min(0) manganese: number;
  @nutrient() @Min(0) phosphorus: number;
  @nutrient() @Min(0) potassium: number;
  @nutrient() @Min(0) selenium: number;
  @nutrient() @Min(0) sodium: number;
  @nutrient() @Min(0) zinc: number;
}

export class NutritionDto {
  @nutrient() @Min(0) @Max(100_000) calories: number;
  @nutrient() @Min(0) @Max(100_000) protein: number;
  @nutrient() @Min(0) @Max(100_000) carbs: number;
  @nutrient() @Min(0) @Max(100_000) fiber: number;
  @nutrient() @Min(0) @Max(100_000) netCarbs: number;
  @nutrient() @Min(0) @Max(100_000) fats: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => VitaminsDto)
  vitamins?: VitaminsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MineralsDto)
  minerals?: MineralsDto;
}

export class CreateFoodDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name: string;

  @IsEnum(FoodUnit)
  unit: FoodUnit;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(100_000)
  nutritionPer: number;

  @ValidateNested()
  @Type(() => NutritionDto)
  nutrition: NutritionDto;
}
