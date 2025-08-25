import { Config } from '../../types';

export default function generateOtpController(config: Config): string {
  return `
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OtpService } from './otp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('otp/request')
  async requestOtp(@Body('email') email: string) {
    return this.otpService.generate(email);
  }

  @Post('otp/verify')
  async verifyOtp(@Body('email') email: string, @Body('code') code: string) {
    return this.otpService.verify(email, code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('otp/resend')
  async resendOtp(@Body('email') email: string) {
    return this.otpService.resend(email);
  }
}
`;
}