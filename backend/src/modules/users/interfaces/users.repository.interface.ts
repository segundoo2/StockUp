import { DeleteResult, UpdateResult } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserDto } from '../dtos/user.dto';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { UpdateAdminDto } from '../dtos/update-admin.dto';

export interface IUsersRepository {
  createUser(userDto: UserDto): Promise<void>;
  updateUserPassword(passwordDto: UpdatePasswordDto): Promise<UpdateResult>;
  updateAdminUser(adminDto: UpdateAdminDto): Promise<UpdateResult>;
  findAllUsers(tenantId: string): Promise<Omit<User, 'password'>[] | null>;
  findOneByUsername(
    username: string,
    tenantId: string,
  ): Promise<Omit<User, 'password'> | null>;
  deleteUser(username: string, tenantId: string): Promise<DeleteResult>;
}
