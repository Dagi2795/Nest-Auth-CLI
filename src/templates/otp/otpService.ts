import { Config } from '../../types';

export default function generateOtpService(config: Config): string {
  return `
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from './otp.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {}

  async generate(userId: number, deliveryMethod: 'sms' | 'email') {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const otp = this.otpRepository.create({ code, userId, expiresAt, deliveryMethod });
    await this.otpRepository.save(otp);
    // TODO: Send OTP via ${config.otpDelivery === 'both' ? 'email or SMS based on deliveryMethod' : config.otpDelivery}
    return { message: 'OTP generated' };
  }
}
`;
}