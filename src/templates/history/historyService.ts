export default function generateHistoryService(): string {
  return `
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserHistory } from './user-history.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(UserHistory)
    private userHistoryRepository: Repository<UserHistory>,
  ) {}

  async findAll(filters: { userId?: number; actionType?: string; date?: string }) {
    const query = this.userHistoryRepository.createQueryBuilder('history');
    if (filters.userId) query.andWhere('history.userId = :userId', { userId: filters.userId });
    if (filters.actionType) query.andWhere('history.actionType = :actionType', { actionType: filters.actionType });
    if (filters.date) query.andWhere('DATE(history.createdAt) = :date', { date: filters.date });
    return query.getMany();
  }

  async logAction(userId: number, actionType: string, details: string) {
    const history = this.userHistoryRepository.create({ userId, actionType, details });
    return this.userHistoryRepository.save(history);
  }
}
`;
}