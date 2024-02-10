import { IsInt, IsNotEmpty } from 'class-validator';

export class GetUserDto {
  @IsNotEmpty()
  @IsInt()
  id: number;
}
