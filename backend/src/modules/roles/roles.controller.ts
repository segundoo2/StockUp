import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { IRolesService } from './interfaces/roles.service.interface';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { Role } from './entities/role.entity';
import { PermissionGuard } from '../../guards/permission.guard';
import { RequiresPermission } from '../../decorators/permission.decorator';
import { TenantId } from '../../decorators/tenant-id.decorator';
import { EPermission } from '../../enum/permissions.enum';
import { IResponse } from '../../interfaces/response.interface';
import { RoleDto } from './dtos/role.dto';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@ApiCookieAuth('access_token')
export class RolesController {
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
    roleDto.tenantId = tenantId;
    return await this.rolesService.createRole(roleDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.ROLES_READ)
  @ApiOperation({ summary: 'Listar todas as Roles do tenant' })
  async findAllRoles(@TenantId() tenantId: string): Promise<IResponse<Role[]>> {
    return await this.rolesService.findAllRoles(tenantId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.ROLES_READ)
  @ApiOperation({ summary: 'Buscar uma Role por ID' })
  async findRoleById(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<Role>> {
    return await this.rolesService.findRoleById(id, tenantId);
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
    return await this.rolesService.updateRole(id, tenantId, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequiresPermission(EPermission.ROLES_DELETE)
  @ApiOperation({ summary: 'Deletar uma Role' })
  async deleteRole(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.rolesService.deleteRole(id, tenantId);
  }
}
