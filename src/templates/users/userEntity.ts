import { Config } from '../../types';

export default function generateUserEntity(config: Config): string {
  return `
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Role } from '../roles/role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

${config.registrationFields
  .filter(field => field.name !== 'password') // Exclude password from dynamic fields to avoid duplication
  .map(field => `
  @Column({ ${field.required ? 'nullable: false' : 'nullable: true'}${field.name === 'username' && config.loginIdentifiers.includes('username') ? ', unique: true' : ''} })
  ${field.name}: ${field.type};
`).join('')}

  @Column({ nullable: false })
  password: string;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];
}
`;
}