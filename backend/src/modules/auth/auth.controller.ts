import { Controller, Post } from '@nestjs/common';
import { IAuthController } from './interfaces/auth.controller.interface';
import type { IAuthService } from './interfaces/auth.service.interface';
import { UserDto } from '../users/dtos/user.dto';
import { ILoginResponse } from './interfaces/login-response.interface';

@Controller('auth')
export class AuthController implements IAuthController {
  constructor(private readonly authService: IAuthService) {}

  @Post()
  async login(
    userDto: Pick<UserDto, 'username' | 'password'>,
  ): Promise<ILoginResponse> {
    return await this.authService.login(userDto);
  }
}
