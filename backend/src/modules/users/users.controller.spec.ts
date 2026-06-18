/* eslint-disable @typescript-eslint/unbound-method */
import { CreateUserDto } from './dto/create-user.dto';
import { ESuccess } from './enum/success.enum';
import { IUsersService } from './interface/users.service.interface';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  describe('create', () => {
    let controller: UsersController;
    let mockService: jest.Mocked<IUsersService>;

    beforeEach(() => {
      mockService = {
        create: jest.fn(),
      };
      controller = new UsersController(mockService);
    });

    it(`It should return the message "${ESuccess.USER_REGISTER}", if the user is successfully registered.`, async () => {
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
});
