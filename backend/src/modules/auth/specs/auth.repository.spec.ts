import { ObjectLiteral, Repository } from 'typeorm';
import { UserDto } from '../../users/dtos/user.dto';
import { User } from '../../users/entities/user.entity';
import { AuthRepository } from '../auth.repository';
import { InternalServerErrorException } from '@nestjs/common';
import { EErrorsGlobal } from '../../../enum/errors-global.enum';

type MockRepository<T extends ObjectLiteral> = Record<
  keyof Repository<T>,
  jest.Mock
>;

describe('AuthRepository', () => {
  let repository: AuthRepository;
  let ormRepositoryMock: MockRepository<User>;

  const userDto: Pick<UserDto, 'username' | 'password'> = {
    username: 'segundo',
    password: '12345678',
  };
  const mockUser: Pick<User, 'id' | 'username' | 'admin' | 'password'> = {
    id: 'uuid-user',
    username: 'user.name',
    admin: true,
    password: '12345678',
  };

  beforeEach(() => {
    ormRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    } as unknown as MockRepository<User>;

    repository = new AuthRepository(
      ormRepositoryMock as unknown as Repository<User>,
    );
  });

  afterEach(() => jest.restoreAllMocks());

  const shouldHandleDatabaseErrors = (
    operation: () => Promise<unknown>,
    mockMethod: () => jest.Mock,
  ) => {
    it('should return InternalServerException when TypeORM throws an error', async () => {
      mockMethod().mockRejectedValue(
        new Error('[TypeOrmModule] Unable to connect to the database'),
      );

      await expect(operation()).rejects.toThrow(
        new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR),
      );
    });
  };

  describe('findUserByUsername', () => {
    it('should return the hash password when the user found', async () => {
      ormRepositoryMock.findOne.mockResolvedValue(mockUser);

      expect(await repository.findUserByUsername(userDto.username)).toBe(
        mockUser,
      );
      expect(ormRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { username: userDto.username },
        select: { id: true, username: true, admin: true, password: true },
      });
    });

    it('should return null when the user not found', async () => {
      ormRepositoryMock.findOne.mockResolvedValue(null);
      expect(await repository.findUserByUsername(userDto.username)).toBe(null);
    });

    shouldHandleDatabaseErrors(
      () => repository.findUserByUsername(userDto.username),
      () => ormRepositoryMock.findOne,
    );
  });
});
