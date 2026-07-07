import { IsBoolean } from 'class-validator';

export class UpdatePurchaseDto {
  @IsBoolean()
  purchased: boolean;
}
