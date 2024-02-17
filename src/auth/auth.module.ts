import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { UserService } from 'src/user/user.service';
import { LocalStrategy } from './strategy/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './serializer';
import { AuthenticatedGuard, LocalAuthGuard, RolesGuard } from './guard';

@Module({
  imports: [PassportModule.register({ session: true })],
  providers: [
    AuthService,
    SendgridService,
    UserService,
    LocalStrategy,
    SessionSerializer,
    LocalAuthGuard,
    AuthenticatedGuard,
    RolesGuard,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
