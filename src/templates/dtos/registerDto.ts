import { Config } from '../../types';

export default function generateRegisterDto(config: Config): string {
  return `
import { IsString, IsEmail, MinLength, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class RegisterDto {
${config.registrationFields.map(field => `
  ${field.required ? '@IsNotEmpty()' : '@IsOptional()'}
  ${field.type === 'string' ? '@IsString()' : '@IsNumber()'}
  ${field.name === 'email' ? '@IsEmail()' : ''}
  ${field.name === 'password' ? '@MinLength(8)' : ''}
  ${field.name}: ${field.type};`).join('\n')}
}
`;
}