/* eslint-disable @typescript-eslint/unbound-method */
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ESuccess } from './enum/success.enum';
import { IUsersRepository } from './interface/users.repository.interface';
import { UsersService } from './users.service';
import { EErrors } from './enum/errors.enum';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<IUsersRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
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

      const result = await service.create(payload);

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

      await expect(service.create(payload)).rejects.toThrow(
        new ConflictException(EErrors.USERNAME_EXIST),
      );
    });
  });

  describe('findOneByUsername', () => {
    it('should return the data of the specified user', async () => {
      const username: string = 'segundo123';
      const userMock: Partial<User> = {
        id: 'uuid-0123',
        username: 'segundo123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findOneByUsername.mockResolvedValue(userMock);

      const result: Partial<User> | null =
        await service.findOneByUsername(username);

      expect(result).toEqual(userMock);
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

    it(`should return message: ${EErrors.USERNAME_NOT_FOUND} if the repository returns null.`, async () => {
      const result = service.findOneByUsername('segundo123');

      await expect(result).rejects.toThrow(
        new NotFoundException(EErrors.USERNAME_NOT_FOUND),
      );
    });
  });
});
