import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetUserByIdDto {
  @Type(() => Number)
  @IsInt()
  id: number;
}
