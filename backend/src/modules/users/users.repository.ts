import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { IUsersRepository } from './interface/users.repository.interface';

@Injectable()
export class UsersRepository implements IUsersRepository {
  async create(dto: CreateUserDto): Promise<string> {
    return await 'This action adds a new user';
  }
}
