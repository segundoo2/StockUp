import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IRolesController } from './interfaces/roles.controller.interface';
import type { IRolesService } from './interfaces/roles.service.interface';
import { RoleDto } from './dtos/role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { Role } from './entities/role.entity';
import { IResponse } from '../../interfaces/response.interface';
import { TenantId } from '../../decorators/tenant-id.decorator';
import { PermissionGuard } from '../../guards/permission.guard';
import { RequiresPermission } from '../../decorators/permission.decorator';
import { EPermission } from '../../enum/permissions.enum';
import { ERolesSuccess } from '../../enum/roles-success.enum';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController implements IRolesController {
  constructor(
    @Inject('IRolesService') private readonly rolesService: IRolesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequiresPermission(EPermission.ROLES_CREATE)
  @ApiOperation({ summary: 'Cria uma nova role para o tenant' })
  @ApiBody({ type: RoleDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: ERolesSuccess.CREATE })
  async createRole(
    @Body() roleDto: RoleDto,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.rolesService.createRole({ ...roleDto, tenantId });
  }

  @Get('permissions')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequiresPermission(EPermission.ROLES_READ)
  @ApiOperation({ summary: 'Lista o catálogo de permissões disponíveis' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ERolesSuccess.PERMISSIONS_FOUND,
  })
  listPermissions(): IResponse<EPermission[]> {
    return this.rolesService.listPermissions();
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequiresPermission(EPermission.ROLES_READ)
  @ApiOperation({ summary: 'Lista todas as roles do tenant' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ERolesSuccess.LIST_FOUND,
  })
  async findAllRoles(
    @TenantId() tenantId: string,
  ): Promise<IResponse<Role[]>> {
    return await this.rolesService.findAllRoles(tenantId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequiresPermission(EPermission.ROLES_READ)
  @ApiOperation({ summary: 'Busca uma role pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID da role' })
  @ApiResponse({ status: HttpStatus.OK, description: ERolesSuccess.FOUND })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<Role>> {
    return await this.rolesService.findById(id, tenantId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequiresPermission(EPermission.ROLES_UPDATE)
  @ApiOperation({ summary: 'Atualiza uma role existente' })
  @ApiParam({ name: 'id', description: 'UUID da role' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: HttpStatus.OK, description: ERolesSuccess.UPDATE })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<IResponse<null>> {
    return await this.rolesService.updateRole(id, tenantId, updateRoleDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequiresPermission(EPermission.ROLES_DELETE)
  @ApiOperation({ summary: 'Remove uma role do tenant' })
  @ApiParam({ name: 'id', description: 'UUID da role' })
  @ApiResponse({ status: HttpStatus.OK, description: ERolesSuccess.DELETE })
  async deleteRole(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.rolesService.deleteRole(id, tenantId);
  }
}
