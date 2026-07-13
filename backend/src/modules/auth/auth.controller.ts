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
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
  ApiHeader,
} from '@nestjs/swagger';
import type { Response, Request } from 'express';
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
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController implements IAuthController {
  constructor(private readonly authService: IAuthService) {}

  private readonly logger = new Logger(AuthService.name);

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza a autenticação do usuário' })
  @ApiBody({ type: LoginDto })
  @ApiHeader({
    name: 'x-device-id',
    required: false,
    description: 'ID único do hardware do dispositivo móvel (Flutter)',
    example: 'uuid-1234-5678-9101',
  })
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
    @Req() req: Request,
    @Body() userDto: Pick<UserDto, 'username' | 'password'>,
  ): Promise<IAuthPayload> {
    const fingerprint =
      (req.headers['x-device-id'] as string) ||
      (req.headers['user-agent'] as string) ||
      'unknown';

    try {
      const response = await this.authService.login(userDto, fingerprint);
      this.logger.log(`[AUTH] Usuário ${userDto.username} logado com sucesso.`);
      return response;
    } catch (error) {
      this.logger.warn(
        `[AUTH] Tentativa de login falhou para o usuário: ${userDto.username}`,
      );
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  @UseInterceptors(SetCookiesInterceptor)
  @ApiCookieAuth('refresh_token')
  @ApiHeader({
    name: 'x-device-id',
    required: false,
    description: 'ID único do hardware do dispositivo móvel (Flutter)',
    example: 'uuid-1234-5678-9101',
  })
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
    description: 'Refresh token inválido, expirado ou dispositivo divergente.',
  })
  async refresh(@Req() req: RequestWithCookies): Promise<IAuthPayload> {
    const userPayload = req.user as IJwtPayload;

    const fingerprint =
      (req.headers['x-device-id'] as string) ||
      (req.headers['user-agent'] as string) ||
      'unknown';

    try {
      const response = await this.authService.refresh(userPayload, fingerprint);
      this.logger.log(
        `[AUTH] Usuário ${userPayload.username} renovou a sessão com sucesso.`,
      );
      return response;
    } catch (error) {
      this.logger.warn(
        `[AUTH] Tentativa de renovação de sessão falhou para o usuário: ${userPayload.username}`,
      );
      throw error;
    }
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
  logout(@Req() req: Request, @Res() res: Response): Response {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };
    const userPayload = req.user as IJwtPayload;

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', { ...cookieOptions, path: '/auth' });

    const response = res.json({ message: ESuccess.LOGOUT });
    this.logger.warn(`[AUTH] O usuário ${userPayload.username} fez logout.`);

    return response;
  }
}
