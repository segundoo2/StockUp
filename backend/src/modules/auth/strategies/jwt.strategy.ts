import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

interface RequestWithCookies extends Request {
  cookies: Record<string, string | undefined>;
}

@Injectable()
export class JwtStategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: (req: Request): string | null => {
        const strictReq = req as RequestWithCookies;

        if (strictReq && strictReq.cookies) {
          const token = strictReq.cookies['access_token'];
          if (token) return token;
        }
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret-key',
    });
  }

  validate(payload: IJwtPayload): IJwtPayload {
    if (!payload) {
      throw new UnauthorizedException('Sessão inválida ou expirada.');
    }
    return payload;
  }
}
