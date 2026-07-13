import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  Param,
  HttpStatus,
  Patch,
  Delete,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';
import { IUsersController } from './interfaces/users.controller.interface';
import type { IUsersService } from './interfaces/users.service.interface';
import { ESuccess } from './enums/success.enum';
import { UsersResponseDto } from './dtos/users-response.dto';
import { UserDto } from './dtos/user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { UpdateAdminDto } from './dtos/update-admin.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../guards/admin.guard';
import { RequiresAdmin } from '../../decorators/admin.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController implements IUsersController {
  constructor(
    @Inject('IUsersService') private readonly usersService: IUsersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequiresAdmin()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Criar um novo usuário (Apenas Admin)' })
  @ApiBody({ type: UserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: ESuccess.CREATE_USER,
    type: UsersResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de validação inválidos.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso restrito a administradores.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acesso inválido ou ausente.',
  })
  async createUser(@Body() userDto: UserDto): Promise<UsersResponseDto> {
    return await this.usersService.createUser(userDto);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Atualizar a senha de um usuário autenticado' })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ESuccess.PASSWORD_UPDATE,
    type: UsersResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Senha atual incorreta ou nova senha inválida.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  async updateUserPassword(
    @Body() userDto: UpdatePasswordDto,
  ): Promise<UsersResponseDto> {
    return await this.usersService.updateUserPassword(userDto);
  }

  @Patch('/admin')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequiresAdmin()
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary:
      'Atualizar o nível de privilégio admin de um usuário (Apenas Admin)',
  })
  @ApiBody({ type: UpdateAdminDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Privilégios de administrador atualizados com sucesso.',
    type: UsersResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso restrito a administradores.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  async updateAdminUser(
    @Body() adminDto: UpdateAdminDto,
  ): Promise<UsersResponseDto> {
    return await this.usersService.updateAdminUser(adminDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Buscar lista de todos os usuários' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Retorna uma mensagem de status e os dados parciais de todos os usuários cadastrados.',
    type: UsersResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Nenhum usuário cadastrado no sistema.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  async findAllUsers(): Promise<UsersResponseDto> {
    return await this.usersService.findAllUsers();
  }

  @Get(':username')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Buscar usuário através do username' })
  @ApiParam({
    name: 'username',
    description: 'O username único do usuário',
    example: 'segundo',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Retorna uma mensagem de status e os dados parciais do usuário encontrado.',
    type: UsersResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  async findOneByUsername(
    @Param('username') username: string,
  ): Promise<UsersResponseDto> {
    return await this.usersService.findOneByUsername(username);
  }

  @Delete(':username')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequiresAdmin()
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Deleta um usuário cadastrado permanentemente (Apenas Admin)',
  })
  @ApiParam({
    name: 'username',
    description: 'O username do usuário a ser deletado',
    example: 'segundo',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description:
      'Usuário deletado com sucesso do banco de dados. Sem conteúdo de retorno.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso restrito a administradores.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  async deleteUser(@Param('username') username: string): Promise<string> {
    return await this.usersService.deleteUser(username);
  }
}
