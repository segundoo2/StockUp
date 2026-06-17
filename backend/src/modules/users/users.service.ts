import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { IUsersService } from './interface/users.service.interface';
import type { IUsersRepository } from './interface/users.repository.interface';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: IUsersRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<string> {
    return await this.usersRepository.create(dto);
  }
}
