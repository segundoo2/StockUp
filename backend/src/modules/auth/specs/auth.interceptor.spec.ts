import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { Response } from 'express';
import { SetCookiesInterceptor } from '../interceptors/auth.interceptor';

describe('SetCookiesInterceptor', () => {
  let interceptor: SetCookiesInterceptor;
  let mockContext: Partial<ExecutionContext>;
  let mockResponse: Pick<Response, 'cookie'>;

  beforeEach(() => {
    interceptor = new SetCookiesInterceptor();

    mockResponse = {
      cookie: jest.fn(),
    };

    // Simula o contexto do NestJS extraindo o objeto de resposta do protocolo HTTP
    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    };
  });

  it('should extract tokens from data and append them to cookies', async () => {
    const mockServiceResult = {
      message: 'LOGIN_SUCCESS',
      data: {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
      },
    };

    const mockCallHandler: CallHandler = {
      handle: () => of(mockServiceResult),
    };

    const observable = await interceptor.intercept(
      mockContext as ExecutionContext,
      mockCallHandler,
    );

    observable.subscribe({
      next: (result) => {
        // 1. Garante que os cookies foram injetados corretamente na resposta
        expect(mockResponse.cookie).toHaveBeenCalledWith(
          'access_token',
          'access-123',
          {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          },
        );

        // 2. Garante que os tokens sensíveis foram removidos do corpo da resposta final
        expect(result).toEqual({ message: 'LOGIN_SUCCESS' });
      },
    });
  });
});
