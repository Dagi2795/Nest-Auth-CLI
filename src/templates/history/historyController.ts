import { Config } from '../../types';

export default function generateHistoryController(config: Config): string {
  return `
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

${config.authType === 'admin' || config.authType === 'both' ? `
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/audit-logs')
  async findAll(
    @Query('userId') userId?: number,
    @Query('actionType') actionType?: string,
    @Query('date') date?: string,
  ) {
    return this.historyService.findAll({ userId, actionType, date });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/history')
  async getAdminHistory(@Query('userId') userId?: number) {
    return this.historyService.findAll({ userId });
  }
` : ''}

${config.authType === 'user' || config.authType === 'both' ? `
  @UseGuards(JwtAuthGuard)
  @Get('user/history')
  async getUserHistory(@Query('userId') userId: number) {
    return this.historyService.findAll({ userId });
  }
` : ''}
}
`;
}