/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserDto } from '../../users/dtos/user.dto';
import { EErrors } from '../../users/enums/errors.enum';
import { AuthService } from '../auth.service';
import { IAuthRepository } from '../interfaces/auth.repository.interface';
import { ESuccess } from '../enums/success.enum';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let mockRepository: jest.Mocked<IAuthRepository>;
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
    mockRepository = {
      findHashPasswordByUsername: jest.fn(),
    };
    service = new AuthService(mockRepository);
  });

  describe('login', () => {
    it('should return NotFoundException when the user not found', async () => {
      mockRepository.findHashPasswordByUsername.mockResolvedValue(null);

      await expect(service.login(userDto)).rejects.toThrow(
        new NotFoundException(EErrors.USER_NOT_FOUND),
      );
      expect(mockRepository.findHashPasswordByUsername).toHaveBeenCalledWith(
        userDto.username,
      );
    });

    it('should return BadRequestException when the userDto.password !== database user.password', async () => {
      const invalidHash = await bcrypt.hash('senha_errada_qualquer', 10);
      mockRepository.findHashPasswordByUsername.mockResolvedValue(invalidHash);

      await expect(service.login(userDto)).rejects.toThrow(
        new BadRequestException(EErrors.USERNAME_PASSWORD_INCORRECT),
      );
      expect(mockRepository.findHashPasswordByUsername).toHaveBeenCalledWith(
        userDto.username,
      );
    });

    it(`should return the message "${ESuccess.LOGIN}" when user login successfully`, async () => {
      mockRepository.findHashPasswordByUsername.mockResolvedValue(
        validPasswordHash,
      );

      expect(await service.login(userDto)).toBe(ESuccess.LOGIN);
      expect(mockRepository.findHashPasswordByUsername).toHaveBeenCalledWith(
        userDto.username,
      );
    });
  });
});
