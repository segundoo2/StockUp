import { DeleteResult, UpdateResult } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserDto } from '../dtos/user.dto';
import { UpdatePasswordDto } from '../dtos/update-password.dto';

export interface IUsersRepository {
  createUser(userDto: UserDto): Promise<void>;

  updateUserPassword(passwordDto: UpdatePasswordDto): Promise<UpdateResult>;

  findAllUsers(tenantId: string): Promise<Omit<User, 'password'>[] | null>;

  findOneByUsername(
    username: string,
    tenantId: string,
  ): Promise<Omit<User, 'password'> | null>;

  deleteUser(username: string, tenantId: string): Promise<DeleteResult>;
}
