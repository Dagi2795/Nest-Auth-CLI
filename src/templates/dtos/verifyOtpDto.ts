export default function generateVerifyOtpDto(): string {
  return `
import { IsString, IsNumber } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  otp: string;

  @IsNumber()
  userId: number;
}
`;
}