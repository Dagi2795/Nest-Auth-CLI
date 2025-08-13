import { Config } from '../../types';

export default function generateAuthController(config: Config): string {
  const userPrefix = config.authType === 'admin' ? 'admin' : 'user';
  const adminPrefix = 'admin';
  const hasUserRoutes = config.authType === 'user' || config.authType === 'both';
  const hasAdminRoutes = config.authType === 'admin' || config.authType === 'both';
  return `
import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
${config.features.includes('forgot-password') ? `import { ForgotPasswordDto } from './dto/forgot-password.dto';` : ''}
${config.features.includes('reset-password') ? `import { ResetPasswordDto } from './dto/reset-password.dto';` : ''}
${config.features.includes('otp-email') || config.features.includes('two-step-verification') ? `import { VerifyOtpDto } from './dto/verify-otp.dto';` : ''}
import { JwtAuthGuard } from './jwt-auth.guard';
${config.authType !== 'user' ? `import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';` : ''}

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

${hasUserRoutes ? `
  @Post('${userPrefix}/signup')
  async signup(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('${userPrefix}/login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('${userPrefix}/logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user);
  }

${config.features.includes('forgot-password') ? `
  @Post('${userPrefix}/forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }` : ''}

${config.features.includes('reset-password') ? `
  @Post('${userPrefix}/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }` : ''}

${config.features.includes('two-step-verification') ? `
  @UseGuards(JwtAuthGuard)
  @Post('${userPrefix}/2fa')
  async enable2fa(@Request() req, @Body('deliveryMethod') deliveryMethod: 'sms' | 'email') {
    return this.authService.enable2fa(req.user, deliveryMethod);
  }

  @UseGuards(JwtAuthGuard)
  @Post('${userPrefix}/2fa/verify')
  async verify2fa(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verify2fa(verifyOtpDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('${userPrefix}/2fa/resend')
  async resend2fa(@Request() req) {
    return this.authService.resend2fa(req.user);
  }` : ''}
` : ''}

${hasAdminRoutes && config.authType !== 'user' ? `
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('${adminPrefix}/signup')
  async adminSignup(@Body() registerDto: RegisterDto) {
    return this.authService.registerAdmin(registerDto);
  }

  @Post('${adminPrefix}/login')
  async adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('${adminPrefix}/logout')
  async adminLogout(@Request() req) {
    return this.authService.logout(req.user);
  }
` : ''}
}
`;
}