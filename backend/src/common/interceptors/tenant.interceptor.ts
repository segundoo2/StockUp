import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

interface IUserPayload {
  tenantId: string;
  sub: string;
  username: string;
}

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      user?: IUserPayload;
      body: Record<string, unknown>;
      params: Record<string, unknown>;
      query: Record<string, unknown>;
    }>();

    const tenantId = request.user?.tenantId;

    if (tenantId) {
      if (request.body && typeof request.body === 'object') {
        request.body.tenantId = tenantId;
      }

      if (request.params && typeof request.params === 'object') {
        request.params.tenantId = tenantId;
      }

      if (request.query && typeof request.query === 'object') {
        request.query.tenantId = tenantId;
      }
    }

    return next.handle();
  }
}
