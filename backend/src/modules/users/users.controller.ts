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
  Logger,
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
import { ESuccess } from '../../enum/users-sucess.enum';
import { UserDto } from './dtos/user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { UpdateAdminDto } from './dtos/update-admin.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../guards/admin.guard';
import { RequiresAdmin } from '../../decorators/admin.decorator';
import { User } from './entities/user.entity';
import { IResponse } from '../../interfaces/response.interface';

@ApiTags('Users')
@Controller('users')
export class UsersController implements IUsersController {
  private readonly logger = new Logger(UsersController.name);

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
  async createUser(
    @Body() userDto: UserDto,
    tenantId: string,
  ): Promise<IResponse<string>> {
    try {
      userDto.tenantId = tenantId;
      this.logger.log(
        `Tentativa de criação de usuário pelo administrador para o username: "${userDto.username}"`,
      );

      const result = await this.usersService.createUser(userDto);

      this.logger.log(`Usuário "${userDto.username}" criado com sucesso.`);
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao criar usuário "${userDto.username}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
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
    type: Object,
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
    tenantId: string,
  ): Promise<IResponse<string | null>> {
    try {
      userDto.tenantId = tenantId;
      this.logger.log(
        'Requisição recebida para atualização de senha de usuário.',
      );

      const result = await this.usersService.updateUserPassword(userDto);

      this.logger.log('Senha do usuário atualizada com sucesso.');
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar senha do usuário "${userDto.username}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
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
    type: Object,
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
    tenantId: string,
  ): Promise<IResponse<null>> {
    try {
      adminDto.tenantId = tenantId;
      this.logger.warn(
        `Alteração de privilégios administrativos solicitada para o usuário: "${adminDto.username}". Novo status Admin: ${adminDto.admin}`,
      );

      const result = await this.usersService.updateAdminUser(adminDto);

      this.logger.log(
        `Privilégios administrativos modificados com sucesso para o usuário: "${adminDto.username}".`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar privilégios do usuário "${adminDto.username}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
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
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Nenhum usuário cadastrado no sistema.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  async findAllUsers(
    tenantId: string,
  ): Promise<IResponse<Omit<User, 'password'>[]>> {
    try {
      this.logger.log('Buscando listagem geral de usuários cadastrados.');
      return await this.usersService.findAllUsers(tenantId);
    } catch (error) {
      this.logger.error(
        `Erro ao buscar listagem de usuários do tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
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
    type: Object,
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
    tenantId: string,
  ): Promise<IResponse<Omit<User, 'password'>>> {
    try {
      this.logger.log(
        `Buscando dados parciais do perfil do username: "${username}".`,
      );
      return await this.usersService.findOneByUsername(username, tenantId);
    } catch (error) {
      this.logger.error(
        `Erro ao buscar usuário "${username}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
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
  async deleteUser(
    @Param('username') username: string,
    tenantId: string,
  ): Promise<IResponse<null>> {
    try {
      this.logger.warn(
        `COMANDO CRÍTICO: Solicitação de exclusão permanente para o username: "${username}".`,
      );

      const result = await this.usersService.deleteUser(username, tenantId);

      this.logger.log(
        `Usuário "${username}" foi excluído permanentemente do banco de dados.`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro crítico ao deletar o usuário "${username}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
