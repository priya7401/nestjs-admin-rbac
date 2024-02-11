import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { SendgridService } from 'src/sendgrid/sendgrid.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthService, SendgridService],
  controllers: [AuthController],
})
export class AuthModule {}
