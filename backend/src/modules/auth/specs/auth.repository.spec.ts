import { ObjectLiteral, Repository } from 'typeorm';
import { UserDto } from '../../users/dtos/user.dto';
import { User } from '../../users/entities/user.entity';
import { AuthRepository } from '../auth.repository';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { EErrorsGlobal } from '../../../enum/errors-global.enum';

type MockRepository<T extends ObjectLiteral> = Record<
  keyof Repository<T>,
  jest.Mock
>;

describe('AuthRepository', () => {
  let repository: AuthRepository;
  let validPasswordHash: string;
  let ormRepositoryMock: MockRepository<User>;

  const userDto: Pick<UserDto, 'username' | 'password'> = {
    username: 'segundo',
    password: '12345678',
  };

  beforeAll(async () => {
    validPasswordHash = await bcrypt.hash(userDto.password as string, 10);
  });

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

  describe('findHashPasswordByUsername', () => {
    it('should return the hash password when the user found', async () => {
      const dbUserMock = {
        id: 'some-uuid',
        password: validPasswordHash,
      } as unknown as User;

      ormRepositoryMock.findOne.mockResolvedValue(dbUserMock);

      expect(
        await repository.findHashPasswordByUsername(userDto.username),
      ).toBe(validPasswordHash);
      expect(ormRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { username: userDto.username },
        select: { password: true },
      });
    });

    it('should return null when the user not found', async () => {
      ormRepositoryMock.findOne.mockResolvedValue(null);
      expect(
        await repository.findHashPasswordByUsername(userDto.username),
      ).toBe(null);
    });

    shouldHandleDatabaseErrors(
      () => repository.findHashPasswordByUsername(userDto.username),
      () => ormRepositoryMock.findOne,
    );
  });
});
