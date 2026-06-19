import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { IUsersRepository } from './interface/users.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ESuccess } from './enum/success.enum';
import { EErrorsGlobal } from '../../enum/errors-global.enum';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<string> {
    try {
      const user: User = this.repository.create(dto);
      await this.repository.save(user);
      return ESuccess.USER_REGISTER;
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findOneByUsername(username: string): Promise<User | null> {
    try {
      return await this.repository.findOne({ where: { username } });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }
}
