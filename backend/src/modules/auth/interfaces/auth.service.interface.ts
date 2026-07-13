import { UserDto } from '../../users/dtos/user.dto';
import { IJwtPayload } from './jwt-payload.interface';
import { IAuthPayload } from './auth-payload.interface';

export interface IAuthService {
  login(userDto: Pick<UserDto, 'username' | 'password'>): Promise<IAuthPayload>;
  refresh(payload: IJwtPayload): Promise<IAuthPayload>;
}
