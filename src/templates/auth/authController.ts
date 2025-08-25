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
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
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

  @Post('${userPrefix}/verify-signup')
  async verifySignup(@Body('email') email: string, @Body('code') code: string, @Body('registerDto') registerDto: RegisterDto) {
    return this.authService.verifyAndCompleteRegistration(email, code, registerDto);
  }

  @Post('${userPrefix}/login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('${userPrefix}/verify-2fa-login')
  async verify2faLogin(@Body('userId') userId: number, @Body('code') code: string) {
    return this.authService.verify2faLogin(userId, code);
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
  async enable2fa(@Request() req, @Body('deliveryMethod') deliveryMethod: 'email') {
    return this.authService.enable2fa(req.user, deliveryMethod);
  }

  @UseGuards(JwtAuthGuard)
  @Post('${userPrefix}/2fa/verify')
  async verify2fa(@Body() verifyOtpDto: { email: string; otp: string }) {
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

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('${adminPrefix}/verify-signup')
  async verifyAdminSignup(@Body('email') email: string, @Body('code') code: string, @Body('registerDto') registerDto: RegisterDto) {
    return this.authService.verifyAndCompleteAdminRegistration(email, code, registerDto);
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