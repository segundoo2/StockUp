import { UpdateAdminDto } from '../dto/update-admin.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UserDto } from '../dto/user.dto';
import { UsersResponseDto } from '../dto/users-response.dto';

export interface IUsersService {
  createUser(userDto: UserDto): Promise<UsersResponseDto>;
  updateUserPassword(passwordDto: UpdatePasswordDto): Promise<UsersResponseDto>;
  updateAdminUser(adminDto: UpdateAdminDto): Promise<UsersResponseDto>;
  findAllUsers(): Promise<UsersResponseDto>;
  findOneByUsername(username: string): Promise<UsersResponseDto>;
  deleteUser(username: string): Promise<string>;
}
