import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class AppMailService {
  constructor(private readonly mailer: MailerService) {}

  async sendVerificationEmail(email: string, token: string) {
    await this.mailer.sendMail({
      to: email,
      subject: "Verify your CPAMaRKeT.Uz account",
      text: `Assalomu alaykum! Please verify your CPAMaRKeT.Uz account using this token: ${token}`
    });
  }

  async sendPasswordReset(email: string, token: string) {
    await this.mailer.sendMail({
      to: email,
      subject: "Reset your password",
      text: `To reset your password, use token: ${token}`
    });
  }
}
