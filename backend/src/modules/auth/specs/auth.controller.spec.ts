/* eslint-disable @typescript-eslint/unbound-method */
import { UserDto } from '../../users/dtos/user.dto';
import { AuthController } from '../auth.controller';
import { IAuthService } from '../interfaces/auth.service.interface';
import { ESuccess } from '../enums/success.enum';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { RequestWithCookies } from '../interfaces/req-with-cookies.interface';
import type { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let mockService: jest.Mocked<IAuthService>;

  beforeEach(() => {
    mockService = {
      login: jest.fn(),
      refresh: jest.fn(),
    };
    controller = new AuthController(mockService);
  });

  const user: Pick<UserDto, 'username' | 'password'> = {
    username: 'segundo',
    password: '12345678',
  };

  describe('login', () => {
    it(`should return the object { message: ${ESuccess.LOGIN}, data: { accessToken: string, refreshToken: string }} when the user login in sucessfully`, async () => {
      mockService.login.mockResolvedValue({
        message: ESuccess.LOGIN,
        data: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      });
      expect(await controller.login(user)).toEqual({
        message: ESuccess.LOGIN,
        data: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      });
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh with user payload and return new tokens', async () => {
      const mockJwtPayload: IJwtPayload = {
        sub: 'user-id-123',
        username: 'user.name',
        admin: false,
      };

      const mockAuthPayload = {
        message: ESuccess.LOGIN,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      };

      const mockRequest = {
        user: mockJwtPayload,
      } as unknown as RequestWithCookies;

      mockService.refresh.mockResolvedValue(mockAuthPayload);

      const result = await controller.refresh(mockRequest);

      expect(mockService.refresh).toHaveBeenCalledWith(mockJwtPayload);
      expect(result).toEqual(mockAuthPayload);
    });
  });

  describe('logout', () => {
    it('should clear access and refresh tokens from cookies and return a success response', () => {
      const mockResponse = {
        clearCookie: jest.fn(),
        json: jest.fn(),
      } as unknown as Response;

      (mockResponse.json as jest.Mock).mockImplementation(
        (body: unknown) => body,
      );

      const result = controller.logout(mockResponse);

      const expectedCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
      };

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expectedCookieOptions,
      );
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expectedCookieOptions,
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: ESuccess.LOGOUT,
      });
      expect(result).toEqual({ message: ESuccess.LOGOUT });
    });
  });
});
