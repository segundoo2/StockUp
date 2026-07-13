import { UserDto } from '../../users/dtos/user.dto';
import { IAuthPayload } from './auth-payload.interface';
import { Request, Response } from 'express';
import { RequestWithCookies } from './req-with-cookies.interface';

export interface IAuthController {
  login(
    req: Request,
    userDto: Pick<UserDto, 'username' | 'password'>,
  ): Promise<IAuthPayload>;

  refresh(req: RequestWithCookies): Promise<IAuthPayload>;

  logout(req: RequestWithCookies, res: Response): Promise<Response>;
}
