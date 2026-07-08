import { DeleteResult, UpdateResult } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserDto } from '../dto/user.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';

export interface IUsersRepository {
  createUser(userDto: UserDto): Promise<void>;
  updateUserPassword(passwordDto: UpdatePasswordDto): Promise<UpdateResult>;
  updateAdminUser(adminDto: UpdateAdminDto): Promise<UpdateResult>;
  findAllUsers(): Promise<Partial<User>[] | null>;
  findOneByUsername(username: string): Promise<Partial<User> | null>;
  deleteUser(username: string): Promise<DeleteResult>;
}
