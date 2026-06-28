/* eslint-disable @typescript-eslint/unbound-method */
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { ESuccess } from './enum/success.enum';
import { IUsersService } from './interface/users.service.interface';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let mockService: jest.Mocked<IUsersService>;

  beforeEach(() => {
    mockService = {
      create: jest.fn(),
      findOneByUsername: jest.fn(),
    };
    controller = new UsersController(mockService);
  });

  describe('create', () => {
    it(`should return the message "${ESuccess.USER_REGISTER}", if the user is successfully registered`, async () => {
      const payload: CreateUserDto = {
        username: 'Edilson',
        password: '12345678',
      };
      mockService.create.mockResolvedValue(ESuccess.USER_REGISTER);

      const result: string = await controller.create(payload);

      expect(result).toBe(ESuccess.USER_REGISTER);
      expect(mockService.create).toHaveBeenCalledWith(payload);
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
      const response: UserResponseDto = {
        message: ESuccess.USER_FOUND,
        data: userMock,
      };
      mockService.findOneByUsername.mockResolvedValue(response);

      const result: UserResponseDto =
        await controller.findOneByUsername(username);

      expect(result).toBe(response);
      expect(mockService.findOneByUsername).toHaveBeenCalledWith(username);
    });
  });
});
