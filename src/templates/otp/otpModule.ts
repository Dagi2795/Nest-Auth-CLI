import { Config } from '../../types';

export default function generateOtpModule(config: Config): string {
  return `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { Otp } from './otp.entity';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [TypeOrmModule.forFeature([Otp]), MailerModule],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
`;
}