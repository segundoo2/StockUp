import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, ObjectLiteral, Repository, UpdateResult } from 'typeorm';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../users.repository';
import { InternalServerErrorException } from '@nestjs/common';
import { EErrorsGlobal } from '../../../enum/errors-global.enum';
import { UserDto } from '../dtos/user.dto';
import { createFakeUser } from '../../../helpers/create-fake-user.helper';

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let ormRepositoryMock: MockRepository<User>;

  const user = createFakeUser();
  user.password = '12345678';
  const roleId = 'c22e5a7d-b2b2-4d76-8809-51a81231f24d';

  const userDto: UserDto = {
    tenantId: '1',
    username: user.username,
    roleIds: [roleId],
    mustChangePassword: user.mustChangePassword,
    password: user.password,
  };

  const createRelationQueryBuilderMock = (
    addMock = jest.fn(),
    removeMock = jest.fn(),
  ) => ({
    relation: jest.fn().mockReturnValue({
      of: jest.fn().mockReturnValue({
        add: addMock,
        remove: removeMock,
      }),
    }),
  });

  beforeEach(async () => {
    const mockFactory = (): MockRepository<User> => ({
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getRepositoryToken(User),
          useFactory: mockFactory,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    ormRepositoryMock = module.get<MockRepository<User>>(
      getRepositoryToken(User),
    );
  });

  afterEach(() => jest.restoreAllMocks());

  const shouldHandleDatabaseErrors = (
    operation: () => Promise<unknown>,
    mockMethod: () => jest.Mock | undefined,
  ) => {
    it('should return InternalServerException when TypeORM throws an error', async () => {
      mockMethod()?.mockRejectedValue(
        new Error('[TypeOrmModule] Unable to connect to the database'),
      );

      await expect(operation()).rejects.toThrow(
        new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR),
      );
    });
  };

  describe('createUser', () => {
    it('should invoke create and save operations successfully', async () => {
      ormRepositoryMock.create?.mockReturnValue(user);
      ormRepositoryMock.save?.mockResolvedValue(user);

      await repository.createUser(userDto);
      expect(ormRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: userDto.username,
          password: userDto.password,
          tenantId: userDto.tenantId,
          mustChangePassword: userDto.mustChangePassword,
          roles: [{ id: roleId }],
        }),
      );
      expect(ormRepositoryMock.save).toHaveBeenCalledWith(user);
    });

    shouldHandleDatabaseErrors(
      () => repository.createUser(userDto),
      () => ormRepositoryMock.save,
    );
  });

  describe('updateUserPassword', () => {
    const response: UpdateResult = { raw: [], affected: 0, generatedMaps: [] };

    it('should return property affected === 1 when the password has successfully persisted', async () => {
      const successResponse = { ...response, affected: 1 };
      ormRepositoryMock.update?.mockResolvedValue(successResponse);

      expect(await repository.updateUserPassword(userDto)).toEqual(
        successResponse,
      );
      expect(ormRepositoryMock.update).toHaveBeenCalledWith(
        { username: userDto.username, tenantId: userDto.tenantId },
        {
          mustChangePassword: userDto.mustChangePassword,
          password: userDto.password,
        },
      );
    });

    it('should return the property affected === 0 when the user not found', async () => {
      ormRepositoryMock.update?.mockResolvedValue(response);
      expect(await repository.updateUserPassword(userDto)).toEqual(response);
    });

    shouldHandleDatabaseErrors(
      () => repository.updateUserPassword(userDto),
      () => ormRepositoryMock.update,
    );
  });

  describe('findAllUsers', () => {
    it('should return all registered users', async () => {
      const usersMock = [createFakeUser(), createFakeUser()];
      ormRepositoryMock.find?.mockResolvedValue(usersMock);

      expect(await repository.findAllUsers('1')).toEqual(usersMock);
    });

    it('should return null if no user is found', async () => {
      ormRepositoryMock.find?.mockResolvedValue([]);
      expect(await repository.findAllUsers('1')).toBeNull();
    });

    shouldHandleDatabaseErrors(
      () => repository.findAllUsers('1'),
      () => ormRepositoryMock.find,
    );
  });

  describe('findOneByUsername', () => {
    it('should return a user when found in the database', async () => {
      ormRepositoryMock.findOne?.mockResolvedValue(user);
      expect(await repository.findOneByUsername('segundo', '1')).toEqual(user);
    });

    it('should return null if user is not found', async () => {
      ormRepositoryMock.findOne?.mockResolvedValue(null);
      expect(await repository.findOneByUsername('segundo', '1')).toBeNull();
    });

    shouldHandleDatabaseErrors(
      () => repository.findOneByUsername('segundo', '1'),
      () => ormRepositoryMock.findOne,
    );
  });

  describe('deleteUser', () => {
    const response: DeleteResult = { raw: [], affected: 1 };

    it('should return the delete result when successfully deleted', async () => {
      ormRepositoryMock.delete?.mockResolvedValue(response);
      expect(await repository.deleteUser('segundo', '1')).toEqual(response);
    });

    it('should return affected 0 when target user does not exist', async () => {
      const failResponse = { ...response, affected: 0 };
      ormRepositoryMock.delete?.mockResolvedValue(failResponse);

      expect(await repository.deleteUser('segundo', '1')).toEqual(failResponse);
    });

    shouldHandleDatabaseErrors(
      () => repository.deleteUser('segundo', '1'),
      () => ormRepositoryMock.delete,
    );
  });

  describe('addRoleToUser', () => {
    it('should call relation query builder add method', async () => {
      const addMock = jest.fn().mockResolvedValue(undefined);
      ormRepositoryMock.createQueryBuilder?.mockReturnValue(
        createRelationQueryBuilderMock(addMock),
      );

      await repository.addRoleToUser(user.id, roleId, '1');

      expect(addMock).toHaveBeenCalledWith(roleId);
    });

    shouldHandleDatabaseErrors(
      () => repository.addRoleToUser(user.id, roleId, '1'),
      () => {
        const addMock = jest.fn();
        ormRepositoryMock.createQueryBuilder?.mockReturnValue(
          createRelationQueryBuilderMock(addMock),
        );
        return addMock;
      },
    );
  });

  describe('removeRoleFromUser', () => {
    it('should call relation query builder remove method', async () => {
      const removeMock = jest.fn().mockResolvedValue(undefined);
      ormRepositoryMock.createQueryBuilder?.mockReturnValue(
        createRelationQueryBuilderMock(jest.fn(), removeMock),
      );

      await repository.removeRoleFromUser(user.id, roleId, '1');

      expect(removeMock).toHaveBeenCalledWith(roleId);
    });

    shouldHandleDatabaseErrors(
      () => repository.removeRoleFromUser(user.id, roleId, '1'),
      () => {
        const removeMock = jest.fn();
        ormRepositoryMock.createQueryBuilder?.mockReturnValue(
          createRelationQueryBuilderMock(jest.fn(), removeMock),
        );
        return removeMock;
      },
    );
  });
});
