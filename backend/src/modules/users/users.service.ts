import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { IUsersService } from './interface/users.service.interface';
import type { IUsersRepository } from './interface/users.repository.interface';
import { User } from './entities/user.entity';
import { EErrors } from './enum/errors.enum';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: IUsersRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<string> {
    const existingUser: Partial<User> | null =
      await this.usersRepository.findOneByUsername(dto.username);

    if (existingUser) {
      throw new ConflictException(EErrors.USERNAME_EXIST);
    }

    return await this.usersRepository.create(dto);
  }

  async findOneByUsername(username: string): Promise<Partial<User> | null> {
    if (!username || username.trim() === '') {
      throw new BadRequestException(EErrors.USERNAME_INVALID);
    }

    const user: Partial<User> | null =
      await this.usersRepository.findOneByUsername(username);

    if (!user) {
      throw new NotFoundException(EErrors.USERNAME_NOT_FOUND);
    }

    return user;
  }
}
