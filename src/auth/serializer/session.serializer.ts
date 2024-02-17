import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private userService: UserService) {
    super();
  }

  serializeUser(user: User, done: CallableFunction) {
    const userDetails = { id: user.id, email: user.email, role: user.role };
    done(null, userDetails);
  }

  async deserializeUser(userDetails: any, done: CallableFunction) {
    const user = await this.userService.getUserById(userDetails.id);
    done(null, user);
  }
}
