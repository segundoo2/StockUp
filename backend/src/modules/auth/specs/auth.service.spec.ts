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
  const testFingerprint = 'test-fingerprint'; // 👈 Centralizado para os testes

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

      await expect(service.login(userDto, testFingerprint)).rejects.toThrow(
        new NotFoundException(EErrors.USER_NOT_FOUND),
      );
    });

    it('should return BadRequestException when the password incorrect', async () => {
      mockRepository.findUserByUsername.mockResolvedValue(mockUser);

      await expect(service.login(userDto, testFingerprint)).rejects.toThrow(
        new BadRequestException(EErrors.PASSWORD_INCORRECT),
      );
    });

    it(`should return tokens when user login successfully`, async () => {
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

      expect(await service.login(userDto, testFingerprint)).toEqual({
        message: ESuccess.LOGIN,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });

      const expectedPayload = {
        sub: mockUser.id,
        username: mockUser.username,
        admin: mockUser.admin,
        fingerprint: testFingerprint, // 👈 Agora o payload exige o fingerprint
      };

      expect(mockTokenService.signAsync).toHaveBeenCalledWith(expectedPayload, {
        expiresIn: '15m',
      });
    });
  });

  describe('refresh', () => {
    it(`should return new tokens based on verified payload and fingerprint`, async () => {
      const tokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      const mockJwtPayload: IJwtPayload = {
        sub: 'uuid-user',
        username: 'user.name',
        admin: true,
        fingerprint: testFingerprint, // 👈 Token antigo continha o fingerprint original
      };

      mockTokenService.signAsync
        .mockResolvedValueOnce(tokens.accessToken)
        .mockResolvedValueOnce(tokens.refreshToken);

      const result = await service.refresh(mockJwtPayload, testFingerprint);

      expect(result).toEqual({
        message: ESuccess.REFRESH,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });

      expect(mockTokenService.signAsync).toHaveBeenNthCalledWith(
        1,
        mockJwtPayload,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
      );
    });
  });
});
