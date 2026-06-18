import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { IUsersRepository } from './interface/users.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<string> {
    return await 'This action adds a new user';
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return await this.repository.findOne({ where: { username } });
  }
}
