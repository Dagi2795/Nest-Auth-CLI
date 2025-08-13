export default function generateUserHistoryEntity(): string {
  return `
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class UserHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  actionType: string;

  @Column()
  details: string;

  @CreateDateColumn()
  createdAt: Date;
}
`;
}