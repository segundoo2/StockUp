/* eslint-disable @typescript-eslint/unbound-method */
import { createFakeUser } from '../../../helpers/create-fake-user.helper';
import { IResponse } from '../../../interfaces/response.interface';
import { UserDto } from '../dtos/user.dto';
import { User } from '../entities/user.entity';
import { ESuccess } from '../../../enum/users-sucess.enum';
import { IUsersService } from '../interfaces/users.service.interface';
import { UsersController } from '../users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let mockService: jest.Mocked<IUsersService>;

  const user = createFakeUser();
  const tenantId = '1';

  beforeEach(() => {
    mockService = {
      createUser: jest.fn(),
      updateUserPassword: jest.fn(),
      updateAdminUser: jest.fn(),
      findAllUsers: jest.fn(),
      findOneByUsername: jest.fn(),
      deleteUser: jest.fn(),
    };
    controller = new UsersController(mockService);
  });

  describe('create', () => {
    it('should forward response data context directly from service layer', async () => {
      const response: IResponse<string> = {
        message: ESuccess.CREATE_USER,
        data: '12345678',
      };
      const userDto: UserDto = {
        username: user.username,
        tenantId,
        mustChangePassword: true,
        admin: true,
      };

      mockService.createUser.mockResolvedValue(response);

      expect(await controller.createUser(userDto, tenantId)).toEqual(response);
      expect(mockService.createUser).toHaveBeenCalledWith(userDto);
    });
  });

  describe('updateUserPassword', () => {
    it('should return corresponding payload details containing update responses', async () => {
      const response: IResponse<string | null> = {
        message: ESuccess.PASSWORD_UPDATE,
        data: '12345678',
      };
      const userDto: UserDto = {
        username: user.username,
        tenantId,
        admin: true,
        mustChangePassword: true,
      };

      mockService.updateUserPassword.mockResolvedValue(response);

      expect(await controller.updateUserPassword(userDto, tenantId)).toEqual(
        response,
      );
      expect(mockService.updateUserPassword).toHaveBeenCalledWith(userDto);
    });
  });

  describe('updateAdminUser', () => {
    it('should output standard structural clear response confirmation mapping', async () => {
      const response = { message: ESuccess.ADMIN_UPDATE, data: null };
      mockService.updateAdminUser.mockResolvedValue(response);

      expect(
        await controller.updateAdminUser(
          { tenantId, username: user.username, admin: true },
          tenantId,
        ),
      ).toEqual(response);
    });
  });

  describe('findAllUsers', () => {
    it('should load list wrapped output schemas properly', async () => {
      const usersMock = [createFakeUser(), createFakeUser()] as Omit<
        User,
        'password'
      >[];
      const response: IResponse<Omit<User, 'password'>[]> = {
        message: ESuccess.USER_FOUND,
        data: usersMock,
      };

      mockService.findAllUsers.mockResolvedValue(response);

      expect(await controller.findAllUsers(tenantId)).toEqual(response);
    });
  });

  describe('findOneByUsername', () => {
    it('should query specific user matching parameters context structures', async () => {
      const response: IResponse<Omit<User, 'password'>> = {
        message: ESuccess.USER_FOUND,
        data: user,
      };
      mockService.findOneByUsername.mockResolvedValue(response);

      expect(
        await controller.findOneByUsername(user.username, tenantId),
      ).toEqual(response);
      expect(mockService.findOneByUsername).toHaveBeenCalledWith(
        user.username,
        tenantId,
      );
    });
  });

  describe('deleteUser', () => {
    it('should perform deletion operation forwarding dynamic statuses', async () => {
      const response: IResponse<null> = {
        message: ESuccess.DELETE_USER,
        data: null,
      };
      mockService.deleteUser.mockResolvedValue(response);

      expect(await controller.deleteUser(user.username, tenantId)).toEqual(
        response,
      );
      expect(mockService.deleteUser).toHaveBeenCalledWith(
        user.username,
        tenantId,
      );
    });
  });
});
