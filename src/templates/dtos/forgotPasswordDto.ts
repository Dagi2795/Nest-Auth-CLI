export default function generateForgotPasswordDto(): string {
  return `
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
`;
}