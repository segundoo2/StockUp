/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserDto } from '../../users/dtos/user.dto';
import { EErrors } from '../../users/enums/errors.enum';
import { AuthService } from '../auth.service';
import { IAuthRepository } from '../interfaces/auth.repository.interface';
import { ESuccess } from '../enums/success.enum';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { ITokenService } from '../interfaces/jwt-service.interface';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

describe('AuthService', () => {
  let service: AuthService;
  let mockRepository: jest.Mocked<IAuthRepository>;
  let mockTokenService: jest.Mocked<ITokenService>;
  let validPasswordHash: string;

  const userDto: Pick<UserDto, 'username' | 'password'> = {
    username: 'segundo',
    password: '12345678',
  };

  // Gera um hash real de verdade uma vez antes dos testes rodarem
  beforeAll(async () => {
    validPasswordHash = await bcrypt.hash(userDto.password as string, 10);
  });

  beforeEach(() => {
    process.env.ACCESS_TOKEN_EXPIRES_IN = '15m';
    process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';

    mockRepository = {
      findUserByUsername: jest.fn(),
    };
    mockTokenService = {
      signAsync: jest.fn(),
    };
    service = new AuthService(mockRepository, mockTokenService);
  });

  const mockUser: Pick<User, 'id' | 'username' | 'admin' | 'password'> = {
    id: 'uuid-user',
    username: 'user.name',
    admin: true,
    password: '12345678',
  };

  describe('login', () => {
    it('should return NotFoundException when the user not found', async () => {
      mockRepository.findUserByUsername.mockResolvedValue(null);

      await expect(service.login(userDto)).rejects.toThrow(
        new NotFoundException(EErrors.USER_NOT_FOUND),
      );
      expect(mockRepository.findUserByUsername).toHaveBeenCalledWith(
        userDto.username,
      );
    });

    it('should return BadRequestException when the userDto.password !== database user.password', async () => {
      mockRepository.findUserByUsername.mockResolvedValue(mockUser);

      await expect(service.login(userDto)).rejects.toThrow(
        new BadRequestException(EErrors.PASSWORD_INCORRECT),
      );
      expect(mockRepository.findUserByUsername).toHaveBeenCalledWith(
        userDto.username,
      );
    });

    it(`should return the object { message: ${ESuccess.LOGIN}, data: { accessToken: string, refreshToken: string }} when user login successfully`, async () => {
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockRepository.findUserByUsername.mockResolvedValue(mockUser);
      mockUser.password = validPasswordHash;

      mockTokenService.signAsync.mockImplementation(
        // eslint-disable-next-line @typescript-eslint/require-await
        async (payload, options) => {
          if (options?.expiresIn === '15m') return tokens.accessToken;
          if (options?.expiresIn === '7d') return tokens.refreshToken;
          return '';
        },
      );
      expect(await service.login(userDto)).toEqual({
        message: ESuccess.LOGIN,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
      expect(mockRepository.findUserByUsername).toHaveBeenCalledWith(
        userDto.username,
      );
      const expectedPayload = {
        sub: mockUser.id,
        username: mockUser.username,
        admin: mockUser.admin,
      };
      expect(mockTokenService.signAsync).toHaveBeenCalledWith(expectedPayload, {
        expiresIn: '15m',
      });
      expect(mockTokenService.signAsync).toHaveBeenCalledWith(expectedPayload, {
        expiresIn: '7d',
      });
    });
  });

  describe('refresh', () => {
    it(`should return the object { message: ${ESuccess.REFRESH}, data: { accessToken: string, refreshToken: string }} based purely on verified payload without touching database`, async () => {
      const tokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      const mockJwtPayload: IJwtPayload = {
        sub: 'uuid-user',
        username: 'user.name',
        admin: true,
      };

      mockTokenService.signAsync
        .mockResolvedValueOnce(tokens.accessToken)
        .mockResolvedValueOnce(tokens.refreshToken);

      const result = await service.refresh(mockJwtPayload);

      expect(result).toEqual({
        message: ESuccess.REFRESH,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });

      expect(mockRepository.findUserByUsername).not.toHaveBeenCalled();

      expect(mockTokenService.signAsync).toHaveBeenNthCalledWith(
        1,
        {
          sub: mockJwtPayload.sub,
          username: mockJwtPayload.username,
          admin: mockJwtPayload.admin,
        },
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
      );

      expect(mockTokenService.signAsync).toHaveBeenNthCalledWith(
        2,
        {
          sub: mockJwtPayload.sub,
          username: mockJwtPayload.username,
          admin: mockJwtPayload.admin,
        },
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN },
      );
    });
  });
});
