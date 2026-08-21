import { IResponse } from '../../../interfaces/response.interface';
import { UpdateUserRoleDto } from '../dtos/update-user-role.dto';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { UserDto } from '../dtos/user.dto';
import { User } from '../entities/user.entity';

export interface IUsersService {
  createUser(userDto: UserDto): Promise<IResponse<string>>;
  updateUserPassword(
    passwordDto: UpdatePasswordDto,
  ): Promise<IResponse<string | null>>;
  updateUserRole(roleDto: UpdateUserRoleDto): Promise<IResponse<null>>;
  findAllUsers(tenantId: string): Promise<IResponse<Omit<User, 'password'>[]>>;
  findOneByUsername(
    username: string,
    tenantId: string,
  ): Promise<IResponse<Omit<User, 'password'>>>;
  deleteUser(username: string, tenantId: string): Promise<IResponse<null>>;
}
