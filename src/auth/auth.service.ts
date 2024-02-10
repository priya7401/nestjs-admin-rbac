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
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwt: JwtService,
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
      console.log('///////////// password reset token: ' + randomToken);
      console.log('///////////// user_id: ' + newUser.id);

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

  generateToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email: email,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });
  }

  async deletePasswordToken(id: string) {
    await this.prisma.token.delete({ where: { id: id } });
  }
}
