import { Config } from '../../types';

export default function generateRolesController(config: Config): string {
  return `
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('roles')
  async create(@Body() createRoleDto: { name: string }) {
    return this.rolesService.create(createRoleDto);
  }

  @Get('roles')
  async findAll() {
    return this.rolesService.findAll();
  }
}
`;
}