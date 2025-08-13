import { Config } from '../../types';

export default function generateAuthModule(config: Config): string {
  return `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
${config.features.includes('otp-email') || config.features.includes('two-step-verification') ? `import { Otp } from '../otp/otp.entity';` : ''}

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role${config.features.includes('otp-email') || config.features.includes('two-step-verification') ? ', Otp' : ''}]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'your-secret-key', // TODO: Move to config
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
`;
}