/* eslint-disable @typescript-eslint/unbound-method */
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { ESuccess } from '../enum/success.enum';
import { IUsersRepository } from '../interface/users.repository.interface';
import { UsersService } from '../users.service';
import { EErrors } from '../enum/errors.enum';
import { User } from '../entities/user.entity';
import { UsersResponseDto } from '../dto/users-response.dto';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<IUsersRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findAllUsers: jest.fn(),
      findOneByUsername: jest.fn(),
    };
    service = new UsersService(mockRepository);
  });
  describe('create', () => {
    it(`should return the message "${ESuccess.USER_REGISTER}", if the user is successfully registered`, async () => {
      const payload: CreateUserDto = {
        username: 'Edilson',
        password: '12345678',
      };
      mockRepository.create.mockResolvedValue(ESuccess.USER_REGISTER);

      const result = await service.createUser(payload);

      expect(result).toBe(ESuccess.USER_REGISTER);
      expect(mockRepository.create).toHaveBeenCalledWith(payload);
    });

    it(`should throw the ConflictException with the message "${EErrors.USERNAME_EXIST}", if the username is already registered`, async () => {
      const payload: CreateUserDto = {
        username: 'edilson.segundo',
        password: '12345678',
      };

      const existingUser: User = {
        id: 'some-uuid-or-id',
        username: payload.username,
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOneByUsername.mockResolvedValue(existingUser);

      await expect(service.createUser(payload)).rejects.toThrow(
        new ConflictException(EErrors.USERNAME_EXIST),
      );
    });
  });

  describe('findAllUsers', () => {
    it(`should return the object: { message: ${ESuccess.USERS_FOUND}, data: Partial<user>[] | null }`, async () => {
      const usersMock: Partial<User>[] = [
        {
          id: 'uuid-0123',
          username: 'segundo123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'uuid-4567',
          username: 'oliveira_dev',
          createdAt: new Date('2026-01-15T10:00:00Z'),
          updatedAt: new Date('2026-05-20T14:30:00Z'),
        },
        {
          id: 'uuid-8910',
          username: 'santos_qa',
          createdAt: new Date('2026-03-01T08:22:00Z'),
          updatedAt: new Date('2026-03-01T08:22:00Z'),
        },
        {
          id: 'uuid-1112',
          username: 'lima_admin',
          createdAt: new Date('2025-12-25T18:00:00Z'),
          updatedAt: new Date('2026-06-10T11:15:00Z'),
        },
      ];
      const response: UsersResponseDto = {
        message: ESuccess.USERS_FOUND,
        data: usersMock,
      };
      mockRepository.findAllUsers.mockResolvedValue(usersMock);

      const result: UsersResponseDto = await service.findAllUsers();

      expect(result).toEqual(response);
    });

    it('should return a NotFoundException if the repository return null', async () => {
      mockRepository.findAllUsers.mockResolvedValue(null);

      const result = service.findAllUsers();

      await expect(result).rejects.toThrow(
        new NotFoundException(EErrors.USERS_NOT_FOUND),
      );
    });
  });

  describe('findOneByUsername', () => {
    it(`should return the object: { message: ${ESuccess.USER_FOUND}, data: Partial<User> | null }`, async () => {
      const username: string = 'segundo123';
      const userMock: Partial<User> = {
        id: 'uuid-0123',
        username: 'segundo123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const response: UsersResponseDto = {
        message: ESuccess.USER_FOUND,
        data: userMock,
      };
      mockRepository.findOneByUsername.mockResolvedValue(userMock);

      const result: UsersResponseDto =
        await service.findOneByUsername(username);

      expect(result).toEqual(response);
      expect(mockRepository.findOneByUsername).toHaveBeenCalledWith(username);
    });

    it('should return a BadRequestException if the username parameter is not defined.', async () => {
      const result = service.findOneByUsername(undefined as unknown as string);

      await expect(result).rejects.toThrow(
        new BadRequestException(EErrors.USERNAME_INVALID),
      );
    });

    it('should return a BadRequestException if the username parameter is an empty string.', async () => {
      const result = service.findOneByUsername('');
      await expect(result).rejects.toThrow(
        new BadRequestException(EErrors.USERNAME_INVALID),
      );
    });

    it('should return a NotFoundException if the repository return null.', async () => {
      const result = service.findOneByUsername('segundo123');

      await expect(result).rejects.toThrow(
        new NotFoundException(EErrors.USERNAME_NOT_FOUND),
      );
    });
  });
});
