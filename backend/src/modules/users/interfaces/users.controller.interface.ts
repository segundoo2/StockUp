import { UpdateAdminDto } from '../dtos/update-admin.dto';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { UserDto } from '../dtos/user.dto';
import { UsersResponseDto } from '../dtos/users-response.dto';

export interface IUsersController {
  createUser(userDto: UserDto): Promise<UsersResponseDto>;
  updateUserPassword(passwordDto: UpdatePasswordDto): Promise<UsersResponseDto>;
  updateAdminUser(adminDto: UpdateAdminDto): Promise<Partial<UsersResponseDto>>;
  findAllUsers(): Promise<UsersResponseDto>;
  findOneByUsername(username: string): Promise<UsersResponseDto>;
  deleteUser(username: string): Promise<string>;
}
