export default function generateJwtStrategy(): string {
  return `
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key', // TODO: Move to config
    });
  }

  async validate(payload: any) {
    console.log('JwtStrategy.validate: Payload:', JSON.stringify(payload));
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
      relations: ['roles'],
    });
    console.log('JwtStrategy.validate: User found:', user ? user.id : 'No user found');
    return {
      sub: payload.sub,
      email: payload.email,
      roles: user?.roles?.map(r => r.name) || [],
    };
  }
}
`;
}