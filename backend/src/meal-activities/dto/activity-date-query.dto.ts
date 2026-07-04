import { IsDateString, IsOptional, Matches } from 'class-validator';

export class ActivityDateQueryDto {
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must use the YYYY-MM-DD format',
  })
  date?: string;
}
