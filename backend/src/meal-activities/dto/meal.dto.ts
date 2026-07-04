import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { MealType } from '../schemas/meal-activity.schema';

export class MealItemDto {
  @IsMongoId()
  foodId: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(1_000_000)
  quantity: number;
}

export class MealListDto {
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique((item: MealItemDto) => item?.foodId, {
    message: 'list cannot contain the same food more than once',
  })
  @ValidateNested({ each: true })
  @Type(() => MealItemDto)
  list: MealItemDto[];
}

export class AddMealDto extends MealListDto {
  @IsEnum(MealType)
  mealType: MealType;
}

export class UpdateMealDto extends MealListDto {}
