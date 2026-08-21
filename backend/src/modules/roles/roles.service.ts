import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IRolesService } from './interfaces/roles.service.interface';
import type { IRolesRepository } from './interfaces/roles.repository.interface';
import { IResponse } from '../../interfaces/response.interface';
import { RoleDto } from './dtos/role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { Role } from './entities/role.entity';
import { ERolesSuccess } from '../../enum/roles-success.enum';
import { ERolesErrors } from '../../enum/roles-errors.enum';
import {
  ALL_PERMISSIONS,
  EPermission,
} from '../../enum/permissions.enum';

@Injectable()
export class RolesService implements IRolesService {
  constructor(
    @Inject('IRolesRepository')
    private readonly rolesRepository: IRolesRepository,
  ) {}

  async createRole(roleDto: RoleDto): Promise<IResponse<null>> {
    await this.rolesRepository.ensureDefaultAdminRole(roleDto.tenantId);

    const existing = await this.rolesRepository.findByName(
      roleDto.name,
      roleDto.tenantId,
    );
    if (existing) {
      throw new ConflictException(ERolesErrors.ROLE_NAME_EXISTS);
    }

    await this.rolesRepository.createRole(roleDto);
    return { message: ERolesSuccess.CREATE, data: null };
  }

  async updateRole(
    id: string,
    tenantId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<IResponse<null>> {
    const role = await this.getRoleForTenant(id, tenantId);
    if (role.isSystem) {
      throw new BadRequestException(ERolesErrors.SYSTEM_ROLE_IMMUTABLE);
    }

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const duplicate = await this.rolesRepository.findByName(
        updateRoleDto.name,
        tenantId,
      );
      if (duplicate) {
        throw new ConflictException(ERolesErrors.ROLE_NAME_EXISTS);
      }
    }

    const result = await this.rolesRepository.updateRole(
      id,
      tenantId,
      updateRoleDto,
    );
    if (result.affected === 0) {
      throw new NotFoundException(ERolesErrors.ROLE_NOT_FOUND);
    }

    return { message: ERolesSuccess.UPDATE, data: null };
  }

  async findById(id: string, tenantId: string): Promise<IResponse<Role>> {
    return {
      message: ERolesSuccess.FOUND,
      data: await this.getRoleForTenant(id, tenantId),
    };
  }

  async findAllRoles(tenantId: string): Promise<IResponse<Role[]>> {
    await this.rolesRepository.ensureDefaultAdminRole(tenantId);
    const roles = await this.rolesRepository.findAllRoles(tenantId);
    return { message: ERolesSuccess.LIST_FOUND, data: roles };
  }

  async deleteRole(id: string, tenantId: string): Promise<IResponse<null>> {
    const role = await this.getRoleForTenant(id, tenantId);
    if (role.isSystem) {
      throw new BadRequestException(ERolesErrors.SYSTEM_ROLE_IMMUTABLE);
    }

    const usersCount = await this.rolesRepository.countUsersByRoleId(
      id,
      tenantId,
    );
    if (usersCount > 0) {
      throw new ConflictException(ERolesErrors.ROLE_IN_USE);
    }

    await this.rolesRepository.deleteRole(id, tenantId);
    return { message: ERolesSuccess.DELETE, data: null };
  }

  listPermissions(): IResponse<EPermission[]> {
    return {
      message: ERolesSuccess.PERMISSIONS_FOUND,
      data: ALL_PERMISSIONS,
    };
  }

  async ensureDefaultAdminRole(tenantId: string): Promise<Role> {
    return await this.rolesRepository.ensureDefaultAdminRole(tenantId);
  }

  async getRoleForTenant(id: string, tenantId: string): Promise<Role> {
    const role = await this.rolesRepository.findById(id, tenantId);
    if (!role) {
      throw new NotFoundException(ERolesErrors.ROLE_NOT_FOUND);
    }
    return role;
  }
}
