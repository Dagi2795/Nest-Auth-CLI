import { Config } from '../../types';

export default function generateUsersController(config: Config): string {
  return `
import { Controller, Get, Post, Patch, Delete, Body, Request, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const userId = parseInt(req.user.sub, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID from token');
    }
    return this.usersService.findOne(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = parseInt(req.user.sub, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID from token');
    }
    return this.usersService.update(userId, updateUserDto);
  }

  ${config.features.includes('delete-account') ? `
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteAccount(@Request() req) {
    const userId = parseInt(req.user.sub, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID from token');
    }
    return this.usersService.delete(userId);
  }` : ''}

  ${config.features.includes('history-tracking') && (config.authType === 'user' || config.authType === 'both') ? `
  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Request() req) {
    const userId = parseInt(req.user.sub, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID from token');
    }
    return this.usersService.getHistory(userId);
  }` : ''}
}

${config.authType !== 'user' ? `
@Controller('admin')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('users')
  async listUsers(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.usersService.findAll(page, limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('add-user')
  async addUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('disable-user')
  async disableUser(@Body('userId') userId: number) {
    return this.usersService.disable(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id/delete-user')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/reset-password')
  async adminResetPassword(@Param('id') id: string) {
    return this.usersService.adminResetPassword(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id/history')
  async getUserHistory(@Param('id') id: string) {
    return this.usersService.getHistory(+id);
  }
}` : ''}
`;
}