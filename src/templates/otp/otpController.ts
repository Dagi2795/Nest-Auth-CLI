import { Config } from '../../types';

export default function generateOtpController(config: Config): string {
  return `
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OtpService } from './otp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
${config.features.includes('otp-email') || config.features.includes('two-step-verification') ? `import { VerifyOtpDto } from '../auth/dto/verify-otp.dto';` : ''}

@Controller('${config.authType === 'admin' ? 'admin' : 'user'}')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

${config.features.includes('otp-email') || config.features.includes('two-step-verification') ? `
  @UseGuards(JwtAuthGuard)
  @Post('otp/generate')
  async generate(@Body('userId') userId: number, @Body('deliveryMethod') deliveryMethod: 'sms' | 'email') {
    return this.otpService.generate(userId, deliveryMethod);
  }` : ''}
}
`;
}