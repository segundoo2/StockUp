import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

export interface IUsersRepository {
  createUser(createUserDto: CreateUserDto): Promise<string>;
  updateUserPassword(username: string, password: string): Promise<string>;
  findAllUsers(): Promise<Partial<User>[] | null>;
  findOneByUsername(username: string): Promise<Partial<User> | null>;
  deleteUser(username: string): Promise<string>;
}
