import { UserDto } from '../../users/dtos/user.dto';
import { AuthController } from '../auth.controller';
import { IAuthService } from '../interfaces/auth.service.interface';
import { ESuccess } from '../enums/success.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let mockService: jest.Mocked<IAuthService>;

  beforeEach(() => {
    mockService = {
      login: jest.fn(),
      logout: jest.fn(),
    };
    controller = new AuthController(mockService);
  });

  const user: Pick<UserDto, 'username' | 'password'> = {
    username: 'segundo',
    password: '12345678',
  };

  describe('login', () => {
    it('should return the message when the user login in sucessfully', async () => {
      mockService.login.mockResolvedValue(ESuccess.LOGIN);
      expect(await controller.login(user)).toBe(ESuccess.LOGIN);
    });
  });

  describe('logout', () => {
    it('should clear the authentication token and return 204 when user logs out', async () => {
      mockService.logout.mockResolvedValue(ESuccess.LOGOUT);
      expect(await controller.logout(user.username)).toBe(ESuccess.LOGOUT);
    });
  });
});
