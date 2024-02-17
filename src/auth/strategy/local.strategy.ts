import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passReqToCallback: true,
    });
  }

  // this func will append the username and password used to authenticate
  // the user in the request object of the API call
  async validate(req: Request | any, email: string, password: string) {
    const role = req.body?.role ?? undefined;

    if (!role) throw new UnauthorizedException('role must be provided');

    if (!email || !password)
      throw new UnauthorizedException('email and password is required');

    const user = await this.authService.validateUser(email, password, role);

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
