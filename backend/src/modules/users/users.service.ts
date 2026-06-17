import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { IUsersService } from './interface/users.service.interface';

@Injectable()
export class UsersService implements IUsersService {
  async create(createUserDto: CreateUserDto): Promise<string> {
    return 'This action adds a new user';
  }
}
