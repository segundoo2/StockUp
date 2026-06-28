import { CreateUserDto } from '../dto/create-user.dto';
import { UsersResponseDto } from '../dto/users-response.dto';

export interface IUsersService {
  createUser(createUserDto: CreateUserDto): Promise<string>;
  findAllUsers(): Promise<UsersResponseDto>;
  findOneByUsername(username: string): Promise<UsersResponseDto>;
}
