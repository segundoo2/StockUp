import { UserDto } from '../../users/dtos/user.dto';
import { IAuthPayload } from './login-response.interface';

export interface IAuthService {
  login(userDto: Pick<UserDto, 'username' | 'password'>): Promise<IAuthPayload>;
  // logout(username: string): Promise<string>;
}
