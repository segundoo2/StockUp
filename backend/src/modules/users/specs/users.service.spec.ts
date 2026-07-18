/* eslint-disable @typescript-eslint/unbound-method */
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ESuccess } from '../../../enum/users-sucess.enum';
import { IUsersRepository } from '../interfaces/users.repository.interface';
import { UsersService } from '../users.service';
import { EErrors } from '../../../enum/users-errors.enum';
import { UpdateResult } from 'typeorm';
import { UpdateAdminDto } from '../dtos/update-admin.dto';
import { ICacheStorageService } from '../../../common/redis/interface/cache-storage.interface';
import { createFakeUser } from '../../../helpers/create-fake-user.helper';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<IUsersRepository>;
  let mockRedisService: jest.Mocked<ICacheStorageService>;

  const fakeTenantId = 'tenant-uuid-999';
  const user = createFakeUser();

  beforeEach(() => {
    mockRepository = {
      createUser: jest.fn(),
      updateUserPassword: jest.fn(),
      updateAdminUser: jest.fn(),
      findAllUsers: jest.fn(),
      findOneByUsername: jest.fn(),
      deleteUser: jest.fn(),
    };

    mockRedisService = {
      setWithExpiry: jest.fn(),
      get: jest.fn(),
    };

    service = new UsersService(mockRepository, mockRedisService);
  });

  describe('Shared Username Validation Guard', () => {
    it.each([
      { label: 'undefined', value: undefined as unknown as string },
      { label: 'empty string', value: '' },
      { label: 'only spaces', value: '   ' },
    ])(
      'should throw BadRequestException if username is $label',
      async ({ value }) => {
        const payload = {
          tenantId: '1',
          username: value,
          mustChangePassword: true,
        };

        await expect(service.updateUserPassword(payload)).rejects.toThrow(
          new BadRequestException(EErrors.USERNAME_INVALID),
        );
        await expect(
          service.updateAdminUser({ ...payload, admin: true }),
        ).rejects.toThrow(new BadRequestException(EErrors.USERNAME_INVALID));
        await expect(
          service.findOneByUsername(value, fakeTenantId),
        ).rejects.toThrow(new BadRequestException(EErrors.USERNAME_INVALID));
        await expect(service.deleteUser(value, fakeTenantId)).rejects.toThrow(
          new BadRequestException(EErrors.USERNAME_INVALID),
        );
      },
    );
  });

  describe('createUser', () => {
    const createDto = {
      tenantId: '1',
      username: user.username,
      admin: true,
      mustChangePassword: true,
    };

    it('should return success message and password payload upon successful registration', async () => {
      const result = await service.createUser(createDto);

      expect(result.message).toBe(ESuccess.CREATE_USER);
      expect(result.data).toHaveLength(8);
    });

    it('should forward ConflictException if the repository catches duplicated keys', async () => {
      mockRepository.createUser.mockRejectedValue(
        new ConflictException(EErrors.USERNAME_EXIST),
      );

      await expect(service.createUser(createDto)).rejects.toThrow(
        new ConflictException(EErrors.USERNAME_EXIST),
      );
    });
  });

  describe('updateUserPassword', () => {
    const response: UpdateResult = { raw: [], affected: 1, generatedMaps: [] };
    const baseDto = {
      tenantId: '1',
      username: user.username,
      mustChangePassword: true,
    };

    it('should generate a temporary password if none is provided in the payload', async () => {
      mockRepository.updateUserPassword.mockResolvedValue(response);

      const result = await service.updateUserPassword(baseDto);

      expect(result.message).toBe(ESuccess.PASSWORD_UPDATE);
      expect(result.data).toHaveLength(8);
      expect(mockRepository.updateUserPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          username: user.username,
          password: expect.stringMatching(/^\$2[ayb]\$\d{2}\$/) as string,
        }),
      );
    });

    it('should update successfully and return null data if cleartext password is provided', async () => {
      mockRepository.updateUserPassword.mockResolvedValue(response);

      const result = await service.updateUserPassword({
        ...baseDto,
        password: 'NovaSenhaDefinida123',
      });

      expect(result.message).toBe(ESuccess.PASSWORD_UPDATE);
      expect(result.data).toBeNull();
    });

    it('should throw NotFoundException when affected rows count is zero', async () => {
      mockRepository.updateUserPassword.mockResolvedValue({
        ...response,
        affected: 0,
      });

      await expect(service.updateUserPassword(baseDto)).rejects.toThrow(
        new NotFoundException(EErrors.USER_NOT_FOUND),
      );
    });
  });

  describe('updateAdminUser', () => {
    const adminDto: UpdateAdminDto = {
      tenantId: '1',
      username: user.username,
      admin: user.admin,
    };
    const response: UpdateResult = { raw: [], affected: 1, generatedMaps: [] };

    it('should update status and return clean generic payload', async () => {
      mockRepository.updateAdminUser.mockResolvedValue(response);

      expect(await service.updateAdminUser(adminDto)).toEqual({
        message: ESuccess.ADMIN_UPDATE,
        data: null,
      });
      expect(mockRepository.updateAdminUser).toHaveBeenCalledWith(adminDto);
    });

    it('should throw NotFoundException if no user matches update parameters', async () => {
      mockRepository.updateAdminUser.mockResolvedValue({
        ...response,
        affected: 0,
      });

      await expect(service.updateAdminUser(adminDto)).rejects.toThrow(
        new NotFoundException(EErrors.ADMIN_INVALID),
      );
    });
  });

  describe('findAllUsers', () => {
    it('should return wrapped users payload array', async () => {
      const users = [user, user];
      mockRepository.findAllUsers.mockResolvedValue(users);

      expect(await service.findAllUsers(fakeTenantId)).toEqual({
        message: ESuccess.USERS_FOUND,
        data: users,
      });
    });

    it('should throw NotFoundException if repository returns null/empty', async () => {
      mockRepository.findAllUsers.mockResolvedValue(null);

      await expect(service.findAllUsers(fakeTenantId)).rejects.toThrow(
        new NotFoundException(EErrors.USERS_NOT_FOUND),
      );
    });
  });

  describe('findOneByUsername', () => {
    it('should return targeted single user profile', async () => {
      mockRepository.findOneByUsername.mockResolvedValue(user);

      expect(
        await service.findOneByUsername(user.username, fakeTenantId),
      ).toEqual({ message: ESuccess.USER_FOUND, data: user });
    });

    it('should throw NotFoundException if target profile does not exist', async () => {
      mockRepository.findOneByUsername.mockResolvedValue(null);

      await expect(
        service.findOneByUsername(user.username, fakeTenantId),
      ).rejects.toThrow(new NotFoundException(EErrors.USER_NOT_FOUND));
    });
  });

  describe('deleteUser', () => {
    it('should purge record and set structural temporary expiration blacklist item inside Redis', async () => {
      mockRepository.findOneByUsername.mockResolvedValue(user);
      mockRepository.deleteUser.mockResolvedValue({ raw: [], affected: 1 });
      mockRedisService.setWithExpiry.mockResolvedValue(undefined);

      expect(await service.deleteUser(user.username, fakeTenantId)).toEqual({
        message: ESuccess.DELETE_USER,
        data: null,
      });
      expect(mockRedisService.setWithExpiry).toHaveBeenCalledWith(
        `blacklist:user:${user.id}`,
        'deleted',
        900,
      );
    });

    it('should throw NotFoundException if entity missing before execution steps', async () => {
      mockRepository.findOneByUsername.mockResolvedValue(null);

      await expect(
        service.deleteUser(user.username, fakeTenantId),
      ).rejects.toThrow(new NotFoundException(EErrors.USER_NOT_FOUND));
    });
  });
});
