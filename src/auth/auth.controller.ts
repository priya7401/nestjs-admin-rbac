import { Body, Controller, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  CreateUserDto,
  ResetPasswordBodyDto,
  ResetPasswordQueryDto,
} from './dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // use a different type of guard to invoke the passport-local strategy
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request) {
    // all the authentication and user validation logic is taken care in the validate() method
    // in passport localStrategy; if the user is validated in the validate() method,
    // the user object is attached to the req and passed further to the AuthController
    return req.user;
  }

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
