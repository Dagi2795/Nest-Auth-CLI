import { Config } from '../../types';

export default function generateUsersModule(config: Config): string {
  return `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController${config.authType !== 'user' ? ', AdminUsersController' : ''} } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
${config.features.includes('history-tracking') ? `import { UserHistory } from '../history/user-history.entity';` : ''}

@Module({
  imports: [TypeOrmModule.forFeature([User, Role${config.features.includes('history-tracking') ? ', UserHistory' : ''}])],
  controllers: [UsersController${config.authType !== 'user' ? ', AdminUsersController' : ''}],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
`;
}