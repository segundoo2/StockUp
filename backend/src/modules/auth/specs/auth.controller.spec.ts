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
    };
    controller = new AuthController(mockService);
  });

  const user: Pick<UserDto, 'username' | 'password'> = {
    username: 'segundo',
    password: '12345678',
  };

  describe('login', () => {
    it(`should return the object { message: ${ESuccess.LOGIN}, data: { accessToken: string, refreshToken: string }} when the user login in sucessfully`, async () => {
      mockService.login.mockResolvedValue({
        message: ESuccess.LOGIN,
        data: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      });
      expect(await controller.login(user)).toBe(ESuccess.LOGIN);
    });
  });
});
