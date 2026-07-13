import { UserDto } from '../../users/dtos/user.dto';
import { ILoginResponse } from './login-response.interface';

export interface IAuthService {
  login(
    userDto: Pick<UserDto, 'username' | 'password'>,
  ): Promise<ILoginResponse>;
  // logout(username: string): Promise<string>;
}
