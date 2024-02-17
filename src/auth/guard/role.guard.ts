import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, User } from '@prisma/client';
import { Request } from 'express';
import { Roles } from 'src/decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // get roles from path handler and controller/class
    const roles = this.reflector.getAllAndMerge(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const user: User = request.user as User;

    // for register route, user is not yet created,
    if (!user) {
      throw new ForbiddenException('Only Admin has access');
    }

    if (!roles.includes(user.role))
      throw new ForbiddenException('Only Admin has access');

    return true;
  }
}
