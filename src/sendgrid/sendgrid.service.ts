import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sendgrid from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  constructor(private config: ConfigService) {
    Sendgrid.setApiKey(config.get('SEND_GRID_KEY'));
  }

  async sendEmail(email: string, passwordResetLink: string) {
    const mail = {
      to: email,
      subject: 'Password reset request',
      from: this.config.get('SENDGRID_VERIFIED_SENDER'),
      text: 'Admin app password reset request',
      html: `<h1>Hello user</h1> <p>Please find the link to set/reset your password: ${passwordResetLink} </p> <p><b>Note:</b> This link will expire in 24hrs and you would have to reqest again to reset your password</>`,
    };

    const transport = await Sendgrid.send(mail);
    console.log('Mail sent to ' + mail.to);
    return transport;
  }
}
