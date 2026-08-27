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
import { EUsersSuccess } from '../../enum/users-sucess.enum';
import { UserDto } from './dtos/user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../guards/permission.guard';
import { RequiresPermission } from '../../decorators/permission.decorator';
import { User } from './entities/user.entity';
import { IResponse } from '../../interfaces/response.interface';
import { TenantId } from '../../decorators/tenant-id.decorator';
import { EPermission } from '../../enum/permissions.enum';

@ApiTags('Users')
@Controller('users')
export class UsersController implements IUsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    @Inject('IUsersService') private readonly usersService: IUsersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequiresPermission(EPermission.USERS_CREATE)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiBody({ type: UserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: EUsersSuccess.CREATE_USER,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de validação inválidos.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado: permissão insuficiente.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acesso inválido ou ausente.',
  })
  async createUser(
    @Body() userDto: UserDto,
    @TenantId() tenantId: string,
  ): Promise<IResponse<string>> {
    try {
      userDto.tenantId = tenantId;
      this.logger.log(
        `Tentativa de criação de usuário para o username: "${userDto.username}"`,
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

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequiresPermission(EPermission.USERS_READ)
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
    @TenantId() tenantId: string,
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
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequiresPermission(EPermission.USERS_READ)
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
    @TenantId() tenantId: string,
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

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequiresPermission(EPermission.USERS_UPDATE_PASSWORD)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Atualizar a senha de um usuário autenticado' })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: EUsersSuccess.PASSWORD_UPDATE,
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
    @TenantId() tenantId: string,
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

  @Post(':username/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.USERS_UPDATE_ROLE)
  @ApiOperation({ summary: 'Adicionar uma Role específica ao usuário' })
  async addRoleToUser(
    @Param('username') username: string,
    @Param('roleId') roleId: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.usersService.addRoleToUser(username, roleId, tenantId);
  }

  @Delete(':username/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.USERS_UPDATE_ROLE)
  @ApiOperation({ summary: 'Remover uma Role específica do usuário' })
  async removeRoleFromUser(
    @Param('username') username: string,
    @Param('roleId') roleId: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.usersService.removeRoleFromUser(
      username,
      roleId,
      tenantId,
    );
  }

  @Delete(':username')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequiresPermission(EPermission.USERS_DELETE)
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Deleta um usuário cadastrado permanentemente',
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
    description: 'Acesso negado: permissão insuficiente.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  async deleteUser(
    @Param('username') username: string,
    @TenantId() tenantId: string,
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
