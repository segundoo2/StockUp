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
  Inject,
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
import { IAuthPayload } from './interfaces/auth-payload.interface';
import { AuthGuard } from '@nestjs/passport';
import { SetCookiesInterceptor } from './interceptors/auth.interceptor';
import { IJwtPayloadWithExpiry } from './interfaces/jwt-payload.interface';
import type { RequestWithCookies } from './interfaces/req-with-cookies.interface';
import { ESuccess } from './enums/success.enum';
import { LoginDto } from './dtos/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController implements IAuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject('IAuthService') private readonly authService: IAuthService,
  ) {}

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
    @Body() loginDto: LoginDto,
  ): Promise<IAuthPayload> {
    const fingerprint =
      (req.headers['x-device-id'] as string) ||
      (req.headers['user-agent'] as string) ||
      'unknown';

    try {
      const response = await this.authService.login(loginDto, fingerprint);
      this.logger.log(
        `[AUTH] Usuário "${loginDto.username}" do Tenant "${loginDto.tenantId}" logado com sucesso.`,
      );
      return response;
    } catch (error) {
      this.logger.warn(
        `[AUTH] Tentativa de login falhou para o usuário: "${loginDto.username}"`,
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
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token inválido, expirado ou dispositivo divergente.',
  })
  async refresh(@Req() req: RequestWithCookies): Promise<IAuthPayload> {
    const userPayload = req.user as IJwtPayloadWithExpiry;

    const fingerprint =
      (req.headers['x-device-id'] as string) ||
      (req.headers['user-agent'] as string) ||
      'unknown';

    try {
      const response = await this.authService.refresh(userPayload, fingerprint);
      this.logger.log(
        `[AUTH] Sessão do usuário "${userPayload.username}" rotacionada com sucesso.`,
      );
      return response;
    } catch (error) {
      this.logger.warn(
        `[AUTH] Falha na rotação de token para o usuário: "${userPayload.username}"`,
      );
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiCookieAuth('refresh_token')
  @ApiOperation({
    summary:
      'Invalida a sessão removendo os cookies de autenticação e revogando o token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout realizado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  async logout(
    @Req() req: RequestWithCookies,
    @Res() res: Response,
  ): Promise<Response> {
    const userPayload = req.user as IJwtPayloadWithExpiry;

    await this.authService.logout(userPayload);

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict' as const,
    };

    res.clearCookie('access_token', {
      ...cookieOptions,
      path: '/',
    });
    res.clearCookie('refresh_token', {
      ...cookieOptions,
      path: '/auth',
    });

    this.logger.log(
      `[AUTH] O usuário "${userPayload.username}" encerrou a sessão (Logout concluído).`,
    );

    return res.json({ message: ESuccess.LOGOUT });
  }
}
