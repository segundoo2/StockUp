import { UserDto } from '../../users/dtos/user.dto';
import { ILoginResponse } from './login-response.interface';

export interface IAuthController {
  login(
    userDto: Pick<UserDto, 'username' | 'password'>,
  ): Promise<ILoginResponse>;
}
