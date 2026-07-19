import { Transform } from 'class-transformer';
import {
  IsEmail,
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

export class SignUpDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name: string;

  @IsEmail()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email: string;

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

  @IsOptional()
  @IsTimeZone()
  @MaxLength(100)
  timezone?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsString()
  password_confirm: string;
}
