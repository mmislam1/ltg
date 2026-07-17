import { IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { WeightUnit } from '../../users/schemas/user.schema';

export class UpdateDailyActivityDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  water?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(250_000)
  steps?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20)
  @Max(700)
  weight?: number;

  @IsOptional()
  @IsEnum(WeightUnit)
  weight_unit?: WeightUnit;
}
