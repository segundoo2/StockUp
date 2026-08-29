import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { IRolesService } from './interfaces/roles.service.interface';
import { IRolesController } from './interfaces/roles.controller.interface';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { Role } from './entities/role.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { EPermission } from '../../common/enum/permissions.enum';
import { IResponse } from '../../common/interfaces/response.interface';
import { RoleDto } from './dtos/role.dto';
import { RequiresPermission } from '../../common/decorators/permission.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { PaginationQueryDto } from '../../common/dtos/pagination-query.dto';
import { IPaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@ApiTags('Roles')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('roles')
export class RolesController implements IRolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(
    @Inject('IRolesService')
    private readonly rolesService: IRolesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequiresPermission(EPermission.ROLES_CREATE)
  @ApiOperation({ summary: 'Criar uma nova Role no tenant' })
  async createRole(
    @Body() roleDto: RoleDto,
    @TenantId() tenantId: string,
  ): Promise<IResponse<Role>> {
    try {
      roleDto.tenantId = tenantId;
      this.logger.log(
        `Tentativa de criação da role "${roleDto.name}" no tenant "${tenantId}".`,
      );

      const result = await this.rolesService.createRole(roleDto);

      this.logger.log(
        `Role "${roleDto.name}" criada com sucesso no tenant "${tenantId}".`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao criar role "${roleDto.name}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.ROLES_READ)
  @ApiOperation({ summary: 'Listar todas as Roles do tenant com paginação' })
  async findAllRoles(
    @TenantId() tenantId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<IPaginatedResponse<Role>> {
    try {
      this.logger.log(
        `Buscando listagem de roles do tenant "${tenantId}" - Página: ${paginationQuery.page ?? 1}, Limite: ${paginationQuery.limit ?? 10}.`,
      );
      return await this.rolesService.findAllRoles(tenantId, paginationQuery);
    } catch (error) {
      this.logger.error(
        `Erro ao buscar roles do tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.ROLES_READ)
  @ApiOperation({ summary: 'Buscar uma Role por ID' })
  async findRoleById(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<Role>> {
    try {
      this.logger.log(`Buscando role ID "${id}" no tenant "${tenantId}".`);
      return await this.rolesService.findRoleById(id, tenantId);
    } catch (error) {
      this.logger.error(
        `Erro ao buscar role ID "${id}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.ROLES_UPDATE)
  @ApiOperation({ summary: 'Atualizar permissões/nome de uma Role' })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    try {
      this.logger.log(`Atualizando role ID "${id}" no tenant "${tenantId}".`);

      const result = await this.rolesService.updateRole(
        id,
        tenantId,
        updateRoleDto,
      );

      this.logger.log(
        `Role ID "${id}" atualizada com sucesso no tenant "${tenantId}".`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar role ID "${id}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequiresPermission(EPermission.ROLES_DELETE)
  @ApiOperation({ summary: 'Deletar uma Role' })
  async deleteRole(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    try {
      this.logger.warn(
        `Solicitação de remoção da role ID "${id}" no tenant "${tenantId}".`,
      );

      const result = await this.rolesService.deleteRole(id, tenantId);

      this.logger.log(
        `Role ID "${id}" removida com sucesso do tenant "${tenantId}".`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao remover role ID "${id}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
