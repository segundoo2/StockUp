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

  const userDto: Pick<UserDto, 'username' | 'tenantId'> = {
    username: 'segundo',
    tenantId: 'tenant-uuid-123',
  };

  const mockUser: Pick<
    User,
    'id' | 'tenantId' | 'username' | 'admin' | 'password'
  > = {
    id: 'uuid-user',
    tenantId: 'tenant-uuid-123',
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

  describe('findUserByUsername', () => {
    it('should return user selection fields when user is found based on username and tenantId', async () => {
      ormRepositoryMock.findOne.mockResolvedValue(mockUser);

      const result = await repository.findUserByUsername(
        userDto.username,
        userDto.tenantId,
      );

      expect(result).toBe(mockUser);
      expect(ormRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { username: userDto.username, tenantId: userDto.tenantId },
        select: {
          id: true,
          tenantId: true,
          username: true,
          admin: true,
          password: true,
        },
      });
    });

    it('should return null when the user is not found in that specific tenant', async () => {
      ormRepositoryMock.findOne.mockResolvedValue(null);

      const result = await repository.findUserByUsername(
        userDto.username,
        userDto.tenantId,
      );

      expect(result).toBe(null);
    });

    it('should throw InternalServerErrorException when TypeORM throws a database error', async () => {
      ormRepositoryMock.findOne.mockRejectedValue(
        new Error('[TypeOrmModule] Connection context dropped'),
      );

      await expect(
        repository.findUserByUsername(userDto.username, userDto.tenantId),
      ).rejects.toThrow(
        new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR),
      );
    });
  });
});
