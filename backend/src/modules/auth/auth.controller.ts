import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IAuthController } from './interfaces/auth.controller.interface';
import { UserDto } from '../users/dto/user.dto';

@Controller('auth')
export class AuthController implements IAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  login(userDto: UserDto): Promise<string> {
    
  }

  @Post()
  logout(): Promise<string> {
    
  }
}
