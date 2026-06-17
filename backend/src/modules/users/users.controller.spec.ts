/* eslint-disable @typescript-eslint/unbound-method */
import { ESuccessMessage } from '../enum/success.enum';
import { CreateUserDto } from './dto/create-user.dto';
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

    it(`It should return the message: ${ESuccessMessage.REGISTER_SUCCESS} if the user is successfully registered.`, async () => {
      const payload: CreateUserDto = {
        username: 'Edilson',
        password: '12345678',
      };
      mockService.create.mockResolvedValue(ESuccessMessage.REGISTER_SUCCESS);

      const result: string = await controller.create(payload);

      expect(result).toBe(ESuccessMessage.REGISTER_SUCCESS);
      expect(mockService.create).toHaveBeenCalledWith(payload);
    });
  });
});
