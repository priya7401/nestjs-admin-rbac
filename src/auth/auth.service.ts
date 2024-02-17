import {
  Body,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateUserDto,
  ResetPasswordBodyDto,
  ResetPasswordQueryDto,
} from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';
import * as crypto from 'crypto';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private sendgrid: SendgridService,
    private userService: UserService,
  ) {}

  async createUser(dto: CreateUserDto) {
    try {
      // step 1: create new user in DB
      const newUser = await this.prisma.user.create({ data: dto });

      // step 2: send email for verification

      // create random token to be sent in the email link to reset the password
      const randomToken = crypto.randomBytes(32).toString('hex');

      // create a hash for the above token to store in DB
      const hash = await argon.hash(randomToken);

      // save the token/hash in the DB
      await this.prisma.token.create({
        data: {
          token: hash,
          user_id: newUser.id,
        },
      });

      // step 3: send success message to user in API response and mail the user
      const passwordResetLink: string = `http://localhost:${this.config.get('PORT')}/api/v1/auth/reset_password?id=${newUser.id}&token=${randomToken}`;

      await this.sendgrid.sendEmail(dto.email, passwordResetLink);

      return {
        message:
          'success, mail sent to set password. This link will expire in 24hrs',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('User already exists, please login!');
        }
      }
      throw error;
    }
  }

  async resetPassword(
    @Body() bodyDto: ResetPasswordBodyDto,
    @Query() queryDto: ResetPasswordQueryDto,
  ) {
    try {
      // check if a token with the given user id is present
      const token = await this.prisma.token.findUniqueOrThrow({
        where: { user_id: parseInt(queryDto.id) },
      });

      // check if token has expired
      const currTime = new Date();
      const differenceInMilliseconds =
        currTime.getTime() - token.created_at.getTime();
      if (differenceInMilliseconds > 24 * 60 * 60 * 60) {
        // delete the token as its not valid anymore
        await this.deletePasswordToken(token.id);
        throw new UnauthorizedException('Link invalid or expired');
      }

      const isTokenValid = await argon.verify(token.token, queryDto.token);

      if (!isTokenValid) {
        // delete the token as its not valid anymore
        await this.deletePasswordToken(token.id);
        throw new UnauthorizedException('Link invalid or expired');
      }

      // delete the token as its not required anymore
      await this.deletePasswordToken(token.id);

      // token has been verified, hash the password and store in DB
      const passwordHash = await argon.hash(bodyDto.password);
      const user = await this.prisma.user.update({
        where: { id: parseInt(queryDto.id) },
        data: {
          password_hash: passwordHash,
        },
      });

      return { user };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found or link expired');
        }
      }
      throw error;
    }
  }

  async validateUser(email: string, password: string, role: string) {
    try {
      const user = await this.userService.getUserByEmail(email);

      let passwordHash = user.password_hash;
      const isValid = await argon.verify(passwordHash, password);

      if (!isValid || Role[role] != user.role)
        throw new UnauthorizedException('Invalid credentials');

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      throw error;
    }
  }

  async deletePasswordToken(id: string) {
    await this.prisma.token.delete({ where: { id: id } });
  }
}
