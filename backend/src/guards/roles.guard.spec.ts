/* eslint-disable @typescript-eslint/unbound-method */
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ForbiddenException } from '@nestjs/common';
import { IJwtPayload } from '../modules/auth/interfaces/jwt-payload.interface';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let mockReflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    mockReflector = {
      get: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(mockReflector);
  });

  // Função auxiliar para criar um ExecutionContext mockado de forma estrita
  const createMockContext = (
    userPayload: IJwtPayload | undefined,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: userPayload,
        }),
      }),
      getHandler: () => () => {}, // 👈 A correção está aqui
    } as unknown as ExecutionContext;
  };

  it('should allow access if the route does not require admin rights', () => {
    mockReflector.get.mockReturnValue(false); // Rota não exige admin

    const context = createMockContext({
      sub: '1',
      username: 'user',
      admin: false,
    });
    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(true);
    expect(mockReflector.get).toHaveBeenCalledWith(
      'requiresAdmin',
      expect.any(Function),
    );
  });

  it('should allow access if the route requires admin and the user is an admin', () => {
    mockReflector.get.mockReturnValue(true); // Rota exige admin

    const context = createMockContext({
      sub: '1',
      username: 'admin',
      admin: true,
    });
    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(true);
  });

  it('should throw ForbiddenException if the route requires admin but the user is not an admin', () => {
    mockReflector.get.mockReturnValue(true); // Rota exige admin

    const context = createMockContext({
      sub: '2',
      username: 'plebeu',
      admin: false,
    });

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Acesso restrito a administradores.'),
    );
  });

  it('should throw ForbiddenException if the route requires admin but no user payload is present', () => {
    mockReflector.get.mockReturnValue(true);

    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Acesso restrito a administradores.'),
    );
  });
});
