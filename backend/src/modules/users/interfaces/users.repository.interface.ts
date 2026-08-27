import { DeleteResult, UpdateResult } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdatePasswordDto } from '../dtos/update-password.dto';

export interface IUsersRepository {
  createUser(userData: Partial<User>): Promise<void>; // 👈 Altere de UserDto para Partial<User>

  findAllUsers(tenantId: string): Promise<Omit<User, 'password'>[] | null>;

  findOneByUsername(
    username: string,
    tenantId: string,
  ): Promise<Omit<User, 'password'> | null>;

  updateUserPassword(passwordDto: UpdatePasswordDto): Promise<UpdateResult>;

  addRoleToUser(
    username: string,
    roleId: string,
    tenantId: string,
  ): Promise<void>;

  removeRoleFromUser(
    username: string,
    roleId: string,
    tenantId: string,
  ): Promise<void>;

  deleteUser(username: string, tenantId: string): Promise<DeleteResult>;
}
