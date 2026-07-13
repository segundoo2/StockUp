import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IJwtPayload } from '../modules/auth/interfaces/jwt-payload.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiresAdmin = this.reflector.get<boolean>(
      'requiresAdmin',
      context.getHandler(),
    );

    if (!requiresAdmin) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: IJwtPayload }>();
    const user = request.user;

    if (!user || user.admin !== true) {
      throw new ForbiddenException('Acesso restrito a administradores.');
    }

    return true;
  }
}
