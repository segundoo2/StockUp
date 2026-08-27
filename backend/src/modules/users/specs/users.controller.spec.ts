/* eslint-disable @typescript-eslint/unbound-method */
import { createFakeUser } from '../../../helpers/create-fake-user.helper';
import { IResponse } from '../../../interfaces/response.interface';
import { UserDto } from '../dtos/user.dto';
import { User } from '../entities/user.entity';
import { EUsersSuccess } from '../../../enum/users-sucess.enum';
import { IUsersService } from '../interfaces/users.service.interface';
import { UsersController } from '../users.controller';
import { ERolesSuccess } from '../../../enum/roles-success.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let mockService: jest.Mocked<IUsersService>;

  const user = createFakeUser();
  const tenantId = '1';
  const roleId = 'c22e5a7d-b2b2-4d76-8809-51a81231f24d';

  beforeEach(() => {
    mockService = {
      createUser: jest.fn(),
      updateUserPassword: jest.fn(),
      findAllUsers: jest.fn(),
      findOneByUsername: jest.fn(),
      deleteUser: jest.fn(),
      addRoleToUser: jest.fn(),
      removeRoleFromUser: jest.fn(),
    };
    controller = new UsersController(mockService);
  });

  describe('createUser', () => {
    it('should forward response data context directly from service layer', async () => {
      const response: IResponse<string> = {
        message: EUsersSuccess.CREATE_USER,
        data: '12345678',
      };
      const userDto: UserDto = {
        username: user.username,
        tenantId,
        mustChangePassword: true,
        roleIds: [roleId],
      };

      mockService.createUser.mockResolvedValue(response);

      expect(await controller.createUser(userDto, tenantId)).toEqual(response);
      expect(mockService.createUser).toHaveBeenCalledWith(userDto);
    });
  });

  describe('updateUserPassword', () => {
    it('should return corresponding payload details containing update responses', async () => {
      const response: IResponse<string | null> = {
        message: EUsersSuccess.PASSWORD_UPDATE,
        data: '12345678',
      };
      const userDto: UserDto = {
        username: user.username,
        tenantId,
        mustChangePassword: true,
        roleIds: [roleId],
      };

      mockService.updateUserPassword.mockResolvedValue(response);

      expect(await controller.updateUserPassword(userDto, tenantId)).toEqual(
        response,
      );
      expect(mockService.updateUserPassword).toHaveBeenCalledWith(userDto);
    });
  });

  describe('findAllUsers', () => {
    it('should load list wrapped output schemas properly', async () => {
      const usersMock = [createFakeUser(), createFakeUser()] as Omit<
        User,
        'password'
      >[];
      const response: IResponse<Omit<User, 'password'>[]> = {
        message: EUsersSuccess.USERS_FOUND,
        data: usersMock,
      };

      mockService.findAllUsers.mockResolvedValue(response);

      expect(await controller.findAllUsers(tenantId)).toEqual(response);
    });
  });

  describe('findOneByUsername', () => {
    it('should query specific user matching parameters context structures', async () => {
      const response: IResponse<Omit<User, 'password'>> = {
        message: EUsersSuccess.USER_FOUND,
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
        message: EUsersSuccess.DELETE_USER,
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

  describe('addRoleToUser', () => {
    it('should call service and return success response', async () => {
      const response: IResponse<null> = {
        message: ERolesSuccess.ROLE_ADDED,
        data: null,
      };
      mockService.addRoleToUser.mockResolvedValue(response);

      expect(await controller.addRoleToUser(user.id, roleId, tenantId)).toEqual(
        response,
      );
      expect(mockService.addRoleToUser).toHaveBeenCalledWith(
        user.id,
        roleId,
        tenantId,
      );
    });
  });

  describe('removeRoleFromUser', () => {
    it('should call service and return success response', async () => {
      const response: IResponse<null> = {
        message: ERolesSuccess.ROLE_REMOVED,
        data: null,
      };
      mockService.removeRoleFromUser.mockResolvedValue(response);

      expect(
        await controller.removeRoleFromUser(user.id, roleId, tenantId),
      ).toEqual(response);
      expect(mockService.removeRoleFromUser).toHaveBeenCalledWith(
        user.id,
        roleId,
        tenantId,
      );
    });
  });
});
