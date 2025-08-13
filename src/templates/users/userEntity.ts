import { Config } from '../../types';

export default function generateUserEntity(config: Config): string {
  return `
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Role } from '../roles/role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

${config.registrationFields.map(field => `
  @Column({ ${field.required ? 'nullable: false' : 'nullable: true'}, ${field.name === 'email' || field.name === 'username' ? 'unique: true' : ''} })
  ${field.name}: ${field.type};`).join('\n')}

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
`;
}