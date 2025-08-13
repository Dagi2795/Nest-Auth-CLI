import { Config } from '../../types';

export default function generateAuthService(config: Config): string {
  const constructorParams = [];
  constructorParams.push(`
    @InjectRepository(User)
    private usersRepository: Repository<User>`);
  if (config.authType !== 'user') {
    constructorParams.push(`
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>`);
  }
  if (config.features.includes('otp-email') || config.features.includes('two-step-verification')) {
    constructorParams.push(`
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>`);
  }
  constructorParams.push(`
    private jwtService: JwtService`);
  const constructorParamsString = constructorParams.join(',\n    ').trim();

  return `
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
${config.features.includes('forgot-password') ? `import { ForgotPasswordDto } from './dto/forgot-password.dto';` : ''}
${config.features.includes('reset-password') ? `import { ResetPasswordDto } from './dto/reset-password.dto';` : ''}
${config.features.includes('otp-email') || config.features.includes('two-step-verification') ? `import { VerifyOtpDto } from './dto/verify-otp.dto'; import { Otp } from '../otp/otp.entity';` : ''}
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(${constructorParamsString}) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: registerDto.email },
        ${config.loginIdentifiers.includes('username') ? `{ username: registerDto.username }` : ''}${config.loginIdentifiers.includes('username') ? ',' : ''}
      ],
    });
    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        throw new ConflictException('Email already exists');
      }
      if (${config.loginIdentifiers.includes('username') ? `registerDto.username && existingUser.username === registerDto.username` : 'false'}) {
        throw new ConflictException('Username already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
      ${config.authType === 'user' ? `roles: [{ name: 'user' }]` : ''}${config.authType === 'user' ? ',' : ''}
    });
    await this.usersRepository.save(user);
    return { message: 'User registered successfully' };
  }

${config.authType !== 'user' ? `
  async registerAdmin(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: registerDto.email },
        ${config.loginIdentifiers.includes('username') ? `{ username: registerDto.username }` : ''}${config.loginIdentifiers.includes('username') ? ',' : ''}
      ],
    });
    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        throw new ConflictException('Email already exists');
      }
      if (${config.loginIdentifiers.includes('username') ? `registerDto.username && existingUser.username === registerDto.username` : 'false'}) {
        throw new ConflictException('Username already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    let adminRole = await this.rolesRepository.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      adminRole = this.rolesRepository.create({ name: 'admin' });
      await this.rolesRepository.save(adminRole);
    }
    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
      roles: [adminRole],
    });
    await this.usersRepository.save(user);
    return { message: 'Admin registered successfully' };
  }` : ''}

  async login(loginDto: LoginDto) {
    let user: User | null = null;
    ${config.autoDetectLogin && config.loginIdentifiers.includes('username') ? `
    if (loginDto.identifier) {
      user = await this.usersRepository.findOne({
        where: [
          { email: loginDto.identifier },
          { username: loginDto.identifier },
        ],
        relations: ['roles'],
      });
    }
    ` : `
    const where: any = {};
    ${config.loginIdentifiers.includes('email') ? `if (loginDto.email) where.email = loginDto.email;` : ''}
    ${config.loginIdentifiers.includes('username') ? `if (loginDto.username) where.username = loginDto.username;` : ''}
    user = await this.usersRepository.findOne({
      where,
      relations: ['roles'],
    });
    `}
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email, roles: user.roles?.map(r => r.name) || [] };
    return {
      access_token: this.jwtService.sign(payload),
      message: 'Login successful',
    };
  }

  async logout(user: any) {
    return { message: 'Logged out successfully' };
  }

${config.features.includes('forgot-password') && (config.authType === 'user' || config.authType === 'both') ? `
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({ where: { email: forgotPasswordDto.email } });
    if (!user) throw new UnauthorizedException('User not found');
    const token = this.jwtService.sign({ email: user.email }, { expiresIn: '15m' });
    // TODO: Send password reset email
    return { message: 'Password reset link sent' };
  }` : ''}

${config.features.includes('reset-password') && (config.authType === 'user' || config.authType === 'both') ? `
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { email } = this.jwtService.verify(resetPasswordDto.token);
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) throw new UnauthorizedException('Invalid token');
      user.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
      await this.usersRepository.save(user);
      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }` : ''}

${config.features.includes('two-step-verification') && (config.authType === 'user' || config.authType === 'both') ? `
  async enable2fa(user: any, deliveryMethod: 'sms' | 'email') {
    const otp = await this.otpRepository.findOne({ where: { userId: user.sub } });
    if (otp) await this.otpRepository.delete(otp.id);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const newOtp = this.otpRepository.create({ code, userId: user.sub, expiresAt, deliveryMethod });
    await this.otpRepository.save(newOtp);
    // TODO: Send OTP via ${config.otpDelivery === 'both' ? 'email or SMS based on deliveryMethod' : config.otpDelivery}
    return { message: '2FA enabled, OTP sent' };
  }

  async verify2fa(verifyOtpDto: VerifyOtpDto) {
    const otp = await this.otpRepository.findOne({ where: { code: verifyOtpDto.otp, userId: verifyOtpDto.userId } });
    if (!otp || otp.expiresAt < new Date()) throw new UnauthorizedException('Invalid or expired OTP');
    await this.otpRepository.delete(otp.id);
    return { message: '2FA verified successfully' };
  }

  async resend2fa(user: any) {
    const otp = await this.otpRepository.findOne({ where: { userId: user.sub } });
    if (otp) await this.otpRepository.delete(otp.id);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const newOtp = this.otpRepository.create({ code, userId: user.sub, expiresAt, deliveryMethod: user.deliveryMethod || '${config.otpDelivery}' });
    await this.otpRepository.save(newOtp);
    // TODO: Send OTP via ${config.otpDelivery === 'both' ? 'email or SMS based on deliveryMethod' : config.otpDelivery}
    return { message: '2FA code resent' };
  }` : ''}
}
`;
}