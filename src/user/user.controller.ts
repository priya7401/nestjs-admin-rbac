import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUserDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getUserDetails(@Query() dto: GetUserDto) {
    return this.userService.getUserDetails(dto);
  }
}
