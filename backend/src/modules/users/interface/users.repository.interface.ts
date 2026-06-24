import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

export interface IUsersRepository {
  create(createUserDto: CreateUserDto): Promise<string>;
  findOneByUsername(username: string): Promise<Partial<User> | null>;
}
