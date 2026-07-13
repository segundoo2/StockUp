import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { RequestWithCookies } from '../interfaces/req-with-cookies.interface';
import { EErrors } from '../enums/errors.enum';

export const cookieRefreshExtractor = (
  req: RequestWithCookies,
): string | null => {
  const strictReq = req;
  if (strictReq && strictReq.cookies) {
    const token = strictReq.cookies['refresh_token'];
    if (token) return token;
  }
  return null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: cookieRefreshExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
    });
  }

  validate(payload: IJwtPayload): IJwtPayload {
    if (!payload) {
      throw new UnauthorizedException(EErrors.FAILED_RETRIEVE_SESSION);
    }
    return payload;
  }
}
