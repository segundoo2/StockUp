/* eslint-disable @typescript-eslint/unbound-method */
import { ConflictException } from '@nestjs/common';
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
    it(`It should return the message "${ESuccess.USER_REGISTER}", if the user is successfully registered.`, async () => {
      const payload: CreateUserDto = {
        username: 'Edilson',
        password: '12345678',
      };
      mockRepository.create.mockResolvedValue(ESuccess.USER_REGISTER);

      const result = await service.create(payload);

      expect(result).toBe(ESuccess.USER_REGISTER);
      expect(mockRepository.create).toHaveBeenCalledWith(payload);
    });
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
