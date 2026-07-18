import { UserDto } from '../../users/dtos/user.dto';
import { IJwtPayloadWithExpiry } from './jwt-payload.interface';
import { IAuthPayload } from './auth-payload.interface';
import { ESuccess } from '../../../enum/auth-success.enum';

export interface IAuthService {
  login(
    userDto: Pick<UserDto, 'username' | 'password'>,
    fingerprint: string,
  ): Promise<IAuthPayload>;

  refresh(
    payload: IJwtPayloadWithExpiry,
    fingerprint: string,
  ): Promise<IAuthPayload>;

  logout(payload: IJwtPayloadWithExpiry): Promise<{ message: ESuccess }>;
}
