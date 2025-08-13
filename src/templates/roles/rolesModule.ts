import { Config } from '../../types';

export default function generateRolesModule(config: Config): string {
  return `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: ${(config.authType === 'admin' || config.authType === 'both') ? '[RolesController]' : '[]'},
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
`;
}