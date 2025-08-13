import { Config } from '../../types';

export default function generatePermissionsModule(config: Config): string {
  return `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { Permission } from './permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: ${(config.authType === 'admin' || config.authType === 'both') ? '[PermissionsController]' : '[]'},
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
`;
}