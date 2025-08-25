import { Config } from '../../types';

export default function generateOtpService(config: Config): string {
  return `
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { Otp } from './otp.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    private mailerService: MailerService,
  ) {}

  async generate(email: string, deliveryMethod: 'email' = 'email', resetLink?: string) {
    if (resetLink) {
      // Send password reset email without OTP
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Request',
        html: \`
          <h2>Reset Your Password</h2>
          <p>Click the link below to reset your password:</p>
          <a href="\${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link expires in 15 minutes.</p>
        \`,
      });
      return { message: 'Password reset link sent to email' };
    }

    // Generate OTP for other cases (e.g., signup, 2FA)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const otp = this.otpRepository.create({ email, code, expiresAt, used: false });
    await this.otpRepository.save(otp);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Your OTP Code',
      html: \`
        <h2>Your OTP Code</h2>
        <p>Your OTP is <strong>\${code}</strong>. It expires in 5 minutes.</p>
      \`,
    });

    return { message: 'OTP sent to email' };
  }

  async verify(email: string, code: string) {
    const otp = await this.otpRepository.findOne({
      where: { email, code, used: false },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    otp.used = true;
    await this.otpRepository.save(otp);

    return { message: 'OTP verified successfully' };
  }

  async resend(email: string) {
    const otp = await this.otpRepository.findOne({ where: { email, used: false } });
    if (otp) await this.otpRepository.delete(otp.id);

    return this.generate(email);
  }
}
`;
}