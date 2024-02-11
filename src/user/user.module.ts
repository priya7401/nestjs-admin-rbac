import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SendgridService } from 'src/sendgrid/sendgrid.service';

@Module({
  controllers: [UserController],
  providers: [UserService, SendgridService],
})
export class UserModule {}
