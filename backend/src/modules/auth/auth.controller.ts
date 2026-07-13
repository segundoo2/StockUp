import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { IAuthController } from './interfaces/auth.controller.interface';
import type { IAuthService } from './interfaces/auth.service.interface';
import { UserDto } from '../users/dtos/user.dto';
import { IAuthPayload } from './interfaces/auth-payload.interface';
import { AuthGuard } from '@nestjs/passport';
import { SetCookiesInterceptor } from './interceptors/auth.interceptor';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import type { RequestWithCookies } from './interfaces/req-with-cookies.interface';
import { ESuccess } from './enums/success.enum';
import { AuthResponseDto, LogoutResponseDto } from './dtos/auth-response.dto';
import { LoginDto } from './dtos/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController implements IAuthController {
  constructor(private readonly authService: IAuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza a autenticação do usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login efetuado com sucesso e tokens gerados.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Senha incorreta.',
  })
  async login(
    @Body() userDto: Pick<UserDto, 'username' | 'password'>,
  ): Promise<IAuthPayload> {
    return await this.authService.login(userDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  @UseInterceptors(SetCookiesInterceptor)
  @ApiCookieAuth('refresh_token')
  @ApiOperation({
    summary: 'Renova os tokens de acesso a partir do cookie de refresh',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens renovados com sucesso.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token inválido ou expirado.',
  })
  async refresh(@Req() req: RequestWithCookies): Promise<IAuthPayload> {
    const userPayload = req.user as IJwtPayload;
    return await this.authService.refresh(userPayload);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Invalida a sessão removendo os cookies de autenticação',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout realizado com sucesso.',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  logout(@Res() res: Response): Response {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    return res.json({ message: ESuccess.LOGOUT });
  }
}
