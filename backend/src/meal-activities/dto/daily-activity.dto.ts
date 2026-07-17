import { IsInt, IsOptional, Max, Min } from 'class-validator';

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
}
