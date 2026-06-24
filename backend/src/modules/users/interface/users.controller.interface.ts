import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

export interface IUsersController {
  create(createUserDto: CreateUserDto): Promise<string>;
  findOneByUsername(username: string): Promise<Partial<User> | null>;
}
