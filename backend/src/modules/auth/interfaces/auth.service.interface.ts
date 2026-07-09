import { UserDto } from '../../users/dtos/user.dto';

export interface IAuthService {
  login(userDto: Pick<UserDto, 'username' | 'password'>): Promise<string>;
  logout(username: string): Promise<string>;
}
