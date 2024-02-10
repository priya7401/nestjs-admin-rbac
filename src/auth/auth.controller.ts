import { Body, Controller, Post, Query } from '@nestjs/common';
import {
  CreateUserDto,
  ResetPasswordBodyDto,
  ResetPasswordQueryDto,
} from './dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('create_user')
  createUser(@Body() dto: CreateUserDto) {
    return this.authService.createUser(dto);
  }

  @Post('reset_password')
  resetPassword(
    @Body() bodyDto: ResetPasswordBodyDto,
    @Query() queryDto: ResetPasswordQueryDto,
  ) {
    return this.authService.resetPassword(bodyDto, queryDto);
  }
}
