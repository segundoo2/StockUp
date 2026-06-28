import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

export interface IUsersService {
  create(createUserDto: CreateUserDto): Promise<string>;
  findOneByUsername(username: string): Promise<UserResponseDto>;
}
