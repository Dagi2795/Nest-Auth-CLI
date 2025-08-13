import { Config } from '../../types';

export default function generateUpdateUserDto(config: Config): string {
  return `
import { IsString, IsEmail, MinLength, IsOptional, IsNumber } from 'class-validator';

export class UpdateUserDto {
${config.registrationFields
    .filter(field => field.name !== 'email')
    .map(field => `
  @IsOptional()
  ${field.type === 'string' ? '@IsString()' : '@IsNumber()'}
  ${field.name === 'password' ? '@MinLength(8)' : ''}
  ${field.name}: ${field.type};`).join('\n')}
}
`;
}