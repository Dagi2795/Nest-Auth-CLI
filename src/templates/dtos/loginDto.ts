import { Config } from '../../types';

export default function generateLoginDto(config: Config): string {
  return `
import { IsString, MinLength${config.autoDetectLogin ? '' : ', IsEmail, IsOptional'} } from 'class-validator';

export class LoginDto {
${config.autoDetectLogin && config.loginIdentifiers.includes('username') ? `
  @IsString()
  identifier: string;
` : `
${config.loginIdentifiers.includes('email') ? `
  @IsEmail()
  @IsOptional()
  email?: string;` : ''}
${config.loginIdentifiers.includes('username') ? `
  @IsString()
  @IsOptional()
  username?: string;` : ''}
`}
  @IsString()
  @MinLength(8)
  password: string;
}
`;
}