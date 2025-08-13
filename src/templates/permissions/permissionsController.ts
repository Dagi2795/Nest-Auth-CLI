import { Config } from '../../types';

export default function generatePermissionsController(config: Config): string {
  return `
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('permissions')
  async create(@Body() createPermissionDto: { name: string }) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get('permissions')
  async findAll() {
    return this.permissionsService.findAll();
  }
}
`;
}