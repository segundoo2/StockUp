/* eslint-disable @typescript-eslint/unbound-method */
import { CreateUserDto } from './dto/create-user.dto';
import { ESuccess } from './enum/success.enum';
import { IUsersRepository } from './interface/users.repository.interface';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<IUsersRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
    };
    service = new UsersService(mockRepository);
  });
  describe('create', () => {
    it(`It should return the message: ${ESuccess.USER_REGISTER} if the user is successfully registered.`, async () => {
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
});
