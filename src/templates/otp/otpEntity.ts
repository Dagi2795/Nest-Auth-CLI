export default function generateOtpEntity(): string {
  return `
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  userId: number;

  @Column()
  deliveryMethod: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
`;
}