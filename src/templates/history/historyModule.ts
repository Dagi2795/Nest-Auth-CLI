import { Config } from '../../types';

export default function generateHistoryModule(config: Config): string {
  return `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { UserHistory } from './user-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserHistory])],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
`;
}