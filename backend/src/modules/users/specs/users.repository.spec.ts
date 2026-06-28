import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { ESuccess } from '../enum/success.enum';
import { UsersRepository } from '../users.repository';
import { InternalServerErrorException } from '@nestjs/common';
import { EErrorsGlobal } from '../../../enum/errors-global.enum';

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let ormRepositoryMock: MockRepository<User>;

  beforeEach(async () => {
    const mockFactory = (): MockRepository<User> => ({
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
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
  afterEach(() => jest.restoreAllMocks);

  describe('create', () => {
    it(`should return the message "${ESuccess.USER_REGISTER}", if the user is successfully registered`, async () => {
      const mockDto: CreateUserDto = {
        username: 'Edilson Segundo',
        password: '12345678',
      };

      const mockUserInstance: User = {
        id: 'um-id-qualquer',
        username: mockDto.username,
        password: mockDto.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ormRepositoryMock.create?.mockReturnValue(mockUserInstance);
      ormRepositoryMock.save?.mockResolvedValue(mockUserInstance);

      const result = await repository.createUser(mockDto);

      expect(ormRepositoryMock.create).toHaveBeenCalledWith(mockDto);
      expect(ormRepositoryMock.save).toHaveBeenCalledWith(mockUserInstance);
      expect(result).toBe(ESuccess.USER_REGISTER);
    });

    it('should return InternalServerException when TypeORM throws an error', async () => {
      const mockDto: CreateUserDto = {
        username: 'Edilson Segundo',
        password: '12345678',
      };

      ormRepositoryMock.save?.mockRejectedValue(
        new Error('[TypeOrmModule] Unable to connect to the database'),
      );

      await expect(repository.createUser(mockDto)).rejects.toThrow(
        new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR),
      );
    });
  });

  describe('findAllUsers', () => {
    it('should return all registred users', async () => {
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
      ormRepositoryMock.find?.mockResolvedValue(usersMock);

      const result: Partial<User>[] | null = await repository.findAllUsers();

      expect(result).toEqual(usersMock);
    });

    it('should return null when there is no registered user', async () => {
      ormRepositoryMock.find?.mockResolvedValue([]);

      expect(await repository.findAllUsers()).toEqual(null);
    });

    it('should return InternalServerException when TypeORM throws an error', async () => {
      ormRepositoryMock.find?.mockRejectedValue(
        new Error('[TypeOrmModule] Unable to connect to the database'),
      );

      await expect(repository.findAllUsers()).rejects.toThrow(
        new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR),
      );
    });
  });

  describe('findOneByUsername', () => {
    it('should return a user when found in the database by TypeORM', async () => {
      const mockUser: Partial<User> = {
        id: '1',
        username: 'john_doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      ormRepositoryMock.findOne?.mockResolvedValue(mockUser);

      const result = await repository.findOneByUsername('john_doe');

      expect(result).toEqual(mockUser);
      expect(ormRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { username: 'john_doe' },
      });
    });

    it('should return null if TypeORM does not find the user', async () => {
      ormRepositoryMock.findOne?.mockResolvedValue(null);

      const result = await repository.findOneByUsername('unknown');

      expect(result).toBeNull();
    });

    it('should return InternalServerException when TypeORM throws an error', async () => {
      ormRepositoryMock.findOne?.mockRejectedValue(
        new Error('[TypeOrmModule] Unable to connect to the database'),
      );

      await expect(repository.findOneByUsername('segundo')).rejects.toThrow(
        new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR),
      );
    });
  });
});
