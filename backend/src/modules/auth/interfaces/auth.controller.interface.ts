import { UserDto } from '../../users/dtos/user.dto';
import { IAuthPayload } from './auth-payload.interface';
import { Response } from 'express';
import { RequestWithCookies } from './req-with-cookies.interface';

export interface IAuthController {
  login(userDto: Pick<UserDto, 'username' | 'password'>): Promise<IAuthPayload>;
  refresh(req: RequestWithCookies): Promise<IAuthPayload>;
  logout(res: Response): Response;
}
