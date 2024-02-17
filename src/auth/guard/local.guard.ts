import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // check the email and the password
    await super.canActivate(context);

    // initialize the session
    const request = context.switchToHttp().getRequest();

    // logIn is part of passport, and it initiates the login for user and creates the session
    await super.logIn(request);

    // if no exceptions were thrown, allow the access to the route
    return true;
  }
}
