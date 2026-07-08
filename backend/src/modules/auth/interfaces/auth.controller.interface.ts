import { UserDto } from '../../users/dto/user.dto';

export interface IAuthController {
  login(userDto: UserDto): Promise<string>;
  logout(): Promise<string>;
}
