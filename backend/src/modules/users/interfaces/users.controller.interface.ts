import { IResponse } from '../../../interfaces/response.interface';
import { UpdateAdminDto } from '../dtos/update-admin.dto';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { UserDto } from '../dtos/user.dto';
import { User } from '../entities/user.entity';

export interface IUsersController {
  createUser(userDto: UserDto, tenantId: string): Promise<IResponse<string>>;
  updateUserPassword(
    passwordDto: UpdatePasswordDto,
    tenantId: string,
  ): Promise<IResponse<string | null>>;

  updateAdminUser(
    adminDto: UpdateAdminDto,
    tenantId: string,
  ): Promise<IResponse<null>>;

  //Implementar paginação depois...
  findAllUsers(tenantId: string): Promise<IResponse<Omit<User, 'password'>[]>>;

  findOneByUsername(
    username: string,
    tenantId: string,
  ): Promise<IResponse<Omit<User, 'password'>>>;

  deleteUser(username: string, tenantId: string): Promise<IResponse<null>>;
}
