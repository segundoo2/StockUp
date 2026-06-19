import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ESuccess } from './enum/success.enum';

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let ormRepositoryMock: MockRepository<User>;

  beforeEach(async () => {
    const mockFactory = (): MockRepository<User> => ({
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
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

    usersRepository = module.get<UsersRepository>(UsersRepository);

    ormRepositoryMock = module.get<MockRepository<User>>(
      getRepositoryToken(User),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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

      const result = await usersRepository.create(mockDto);

      expect(ormRepositoryMock.create).toHaveBeenCalledWith(mockDto);
      expect(ormRepositoryMock.save).toHaveBeenCalledWith(mockUserInstance);
      expect(result).toBe(ESuccess.USER_REGISTER);
    });
  });
  describe('findOneByUsername', () => {
    it('should return a user when found in the database by TypeORM', async () => {
      const mockUser: User = {
        id: '1',
        username: 'john_doe',
        password: '12345678',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      ormRepositoryMock.findOne?.mockResolvedValue(mockUser);

      const result = await usersRepository.findOneByUsername('john_doe');

      expect(result).toEqual(mockUser);
      expect(ormRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { username: 'john_doe' },
      });
    });

    it('should return null if TypeORM does not find the user', async () => {
      ormRepositoryMock.findOne?.mockResolvedValue(null);

      const result = await usersRepository.findOneByUsername('unknown');

      expect(result).toBeNull();
    });
  });
});
