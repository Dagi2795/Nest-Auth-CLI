import { Config } from '../../types';

export default function generateAuthService(config: Config): string {
  return `
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OtpService } from '../otp/otp.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly baseUrl = process.env.BASE_URL || 'http://localhost:3000'; // Default to 3000, configurable via .env

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  async register(registerDto: RegisterDto) {
    const where = [{ email: registerDto.email }${config.loginIdentifiers.includes('username') ? ', { username: registerDto.username }' : ''}];
    const existingUser = await this.usersRepository.findOne({ where });
    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        throw new ConflictException('Email already exists');
      }
      ${config.loginIdentifiers.includes('username') ? `
      if (registerDto.username && existingUser.username === registerDto.username) {
        throw new ConflictException('Username already exists');
      }
      ` : ''}
    }

    await this.otpService.generate(registerDto.email);
    return { message: 'OTP sent to email for verification' };
  }

  async verifyAndCompleteRegistration(email: string, code: string, registerDto: RegisterDto) {
    await this.otpService.verify(email, code);

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
      roles: [{ name: 'user' }],
    });
    await this.usersRepository.save(user);
    return { message: 'User registered successfully' };
  }

  async registerAdmin(registerDto: RegisterDto) {
    const where = [{ email: registerDto.email }${config.loginIdentifiers.includes('username') ? ', { username: registerDto.username }' : ''}];
    const existingUser = await this.usersRepository.findOne({ where });
    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        throw new ConflictException('Email already exists');
      }
      ${config.loginIdentifiers.includes('username') ? `
      if (registerDto.username && existingUser.username === registerDto.username) {
        throw new ConflictException('Username already exists');
      }
      ` : ''}
    }

    await this.otpService.generate(registerDto.email);
    return { message: 'OTP sent to email for verification' };
  }

  async verifyAndCompleteAdminRegistration(email: string, code: string, registerDto: RegisterDto) {
    await this.otpService.verify(email, code);

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
  }

  async login(loginDto: LoginDto) {
    let user: User | null = null;
    ${config.autoDetectLogin && config.loginIdentifiers.includes('username') ? `
    if (loginDto.identifier) {
      user = await this.usersRepository.findOne({
        where: [
          { email: loginDto.identifier },
          ${config.loginIdentifiers.includes('username') ? '{ username: loginDto.identifier }' : '{}'}
        ],
        relations: ['roles'],
      });
    }
    ` : `
    const where: any = {};
    ${config.loginIdentifiers.includes('email') ? 'if (loginDto.email) where.email = loginDto.email;' : ''}
    ${config.loginIdentifiers.includes('username') ? 'if (loginDto.username) where.username = loginDto.username;' : ''}
    user = await this.usersRepository.findOne({
      where,
      relations: ['roles'],
    });
    `}
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.twoFactorEnabled) {
      await this.otpService.generate(user.email);
      return { message: '2FA OTP sent to email', userId: user.id };
    }
    const payload = { sub: user.id, email: user.email, roles: user.roles?.map(r => r.name) || [] };
    return {
      access_token: this.jwtService.sign(payload),
      message: 'Login successful',
    };
  }

  async verify2faLogin(userId: number, code: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new UnauthorizedException('User not found');
    await this.otpService.verify(user.email, code);
    const payload = { sub: user.id, email: user.email, roles: user.roles?.map(r => r.name) || [] };
    return {
      access_token: this.jwtService.sign(payload),
      message: '2FA login successful',
    };
  }

  async logout(user: any) {
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({ where: { email: forgotPasswordDto.email } });
    if (!user) throw new UnauthorizedException('User not found');
    const token = this.jwtService.sign({ email: user.email }, { expiresIn: '15m' });
    const resetLink = \`\${this.baseUrl}/user/reset-password?token=\${token}\`;
    await this.otpService.generate(user.email, 'email', resetLink);
    return { message: 'Password reset link sent to email' };
  }

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
  }

  async enable2fa(user: any, deliveryMethod: 'email' = 'email') {
    const userEntity = await this.usersRepository.findOne({ where: { id: user.sub } });
    if (!userEntity) throw new UnauthorizedException('User not found');
    userEntity.twoFactorEnabled = true;
    await this.usersRepository.save(userEntity);
    await this.otpService.generate(user.email, deliveryMethod);
    return { message: '2FA enabled, OTP sent' };
  }

  async verify2fa(verifyOtpDto: { email: string; otp: string }) {
    await this.otpService.verify(verifyOtpDto.email, verifyOtpDto.otp);
    return { message: '2FA verified successfully' };
  }

  async resend2fa(user: any) {
    const userEntity = await this.usersRepository.findOne({ where: { id: user.sub } });
    if (!userEntity) throw new UnauthorizedException('User not found');
    return this.otpService.resend(userEntity.email);
  }
}
`;
}