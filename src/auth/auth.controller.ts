import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  CreateUserDto,
  ResetPasswordBodyDto,
  ResetPasswordQueryDto,
} from './dto';
import { AuthService } from './auth.service';
import { AuthenticatedGuard, LocalAuthGuard, RolesGuard } from './guard';
import { Request } from 'express';
import { Roles } from 'src/decorators';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    // TODO: handle the case of eixstence of only 1 SUPER_ADMIN
    if (dto.role != Role.ADMIN)
      throw new ForbiddenException(
        'Only Admin can register or create new account',
      );
    return this.authService.createUser(dto);
  }

  // use a different type of guard to invoke the passport-local strategy
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request) {
    // all the authentication and user validation logic is taken care in the validate() method
    // in passport localStrategy; if the user is validated in the validate() method,
    // the user object is attached to the req and passed further to the AuthController
    return req.user;
  }

  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles([Role.ADMIN])
  @Post('create_user')
  createUser(@Body() dto: CreateUserDto) {
    // ADMIN can only create power user and user
    if (dto.role == Role.POWER_USER || dto.role == Role.USER) {
      return this.authService.createUser(dto);
    }
    throw new ForbiddenException('Only Admin can create Power User and User');
  }

  @Post('reset_password')
  resetPassword(
    @Body() bodyDto: ResetPasswordBodyDto,
    @Query() queryDto: ResetPasswordQueryDto,
  ) {
    return this.authService.resetPassword(bodyDto, queryDto);
  }
}
