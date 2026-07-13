import { UserDto } from '../../users/dtos/user.dto';
import { IJwtPayload } from './jwt-payload.interface';
import { IAuthPayload } from './auth-payload.interface';

export interface IAuthService {
  login(
    userDto: Pick<UserDto, 'username' | 'password'>,
    fingerprint: string,
  ): Promise<IAuthPayload>;
  refresh(payload: IJwtPayload, fingerprint: string): Promise<IAuthPayload>;
}
