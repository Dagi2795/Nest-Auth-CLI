import { Config } from '../../types';

export default function generateUsersService(config: Config): string {
  return `
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserHistory } from '../history/user-history.entity';
import { Role } from '../roles/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserHistory)
    private userHistoryRepository: Repository<UserHistory>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ['roles'] });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(page: number, limit: number) {
    return this.usersRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['roles'],
    });
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        ${config.loginIdentifiers.includes('username') ? `{ username: createUserDto.username }` : ''}${config.loginIdentifiers.includes('username') ? ',' : ''}
      ],
    });
    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Email already exists');
      }
      if (${config.loginIdentifiers.includes('username') ? `createUserDto.username && existingUser.username === createUserDto.username` : 'false'}) {
        throw new ConflictException('Username already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.usersRepository.save(user);
    const history = this.userHistoryRepository.create({
      userId: savedUser.id,
      actionType: 'CREATE',
      details: 'User created',
    });
    await this.userHistoryRepository.save(history);
    return savedUser;
  }

  async createAdmin(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        ${config.loginIdentifiers.includes('username') ? `{ username: createUserDto.username }` : ''}${config.loginIdentifiers.includes('username') ? ',' : ''}
      ],
    });
    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Email already exists');
      }
      if (${config.loginIdentifiers.includes('username') ? `createUserDto.username && existingUser.username === createUserDto.username` : 'false'}) {
        throw new ConflictException('Username already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    let adminRole = await this.rolesRepository.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      adminRole = this.rolesRepository.create({ name: 'admin' });
      await this.rolesRepository.save(adminRole);
    }
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles: [adminRole],
    });
    const savedUser = await this.usersRepository.save(user);
    const history = this.userHistoryRepository.create({
      userId: savedUser.id,
      actionType: 'CREATE',
      details: 'Admin user created',
    });
    await this.userHistoryRepository.save(history);
    return savedUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await this.usersRepository.update(id, updateUserDto);
    const history = this.userHistoryRepository.create({
      userId: id,
      actionType: 'UPDATE',
      details: 'User updated: ' + JSON.stringify(updateUserDto),
    });
    await this.userHistoryRepository.save(history);
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.findOne(id);
    const history = this.userHistoryRepository.create({
      userId: id,
      actionType: 'DELETE',
      details: 'User deleted',
    });
    await this.userHistoryRepository.save(history);
    return this.usersRepository.delete(id);
  }

  async disable(id: number) {
    await this.findOne(id);
    const history = this.userHistoryRepository.create({
      userId: id,
      actionType: 'DISABLE',
      details: 'User disabled',
    });
    await this.userHistoryRepository.save(history);
    return this.usersRepository.update(id, { isActive: false });
  }

  async adminResetPassword(id: number) {
    await this.findOne(id);
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(id, { password: hashedPassword });
    const history = this.userHistoryRepository.create({
      userId: id,
      actionType: 'RESET_PASSWORD',
      details: 'Admin reset user password',
    });
    await this.userHistoryRepository.save(history);
    return { message: 'Password reset initiated', newPassword };
  }

  async getHistory(id: number) {
    return this.userHistoryRepository.find({ where: { userId: id } });
  }
}
`;
}