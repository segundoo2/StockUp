import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IRolesService } from './interfaces/roles.service.interface';
import type { IRolesRepository } from './interfaces/roles.repository.interface';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { Role } from './entities/role.entity';
import { IResponse } from '../../interfaces/response.interface';
import { ERolesSuccess } from '../../enum/roles-success.enum';
import { ERolesErrors } from '../../enum/roles-errors.enum';
import { RoleDto } from './dtos/role.dto';

@Injectable()
export class RolesService implements IRolesService {
  constructor(
    @Inject('IRolesRepository')
    private readonly rolesRepository: IRolesRepository,
  ) {}

  async createRole(roleDto: RoleDto): Promise<IResponse<Role>> {
    const role = await this.rolesRepository.createRole(roleDto);
    return {
      message: ERolesSuccess.CREATE_ROLE,
      data: role,
    };
  }

  async findAllRoles(tenantId: string): Promise<IResponse<Role[]>> {
    const roles = await this.rolesRepository.findAllRoles(tenantId);
    if (!roles) {
      throw new NotFoundException(ERolesErrors.ROLES_NOT_FOUND);
    }
    return {
      message: ERolesSuccess.ROLES_FOUND,
      data: roles,
    };
  }

  async findRoleById(id: string, tenantId: string): Promise<IResponse<Role>> {
    const role = await this.rolesRepository.findRoleById(id, tenantId);
    if (!role) {
      throw new NotFoundException(ERolesErrors.ROLE_NOT_FOUND);
    }
    return {
      message: ERolesSuccess.ROLE_FOUND,
      data: role,
    };
  }

  async updateRole(
    id: string,
    tenantId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<IResponse<null>> {
    const updatedResult = await this.rolesRepository.updateRole(
      id,
      tenantId,
      updateRoleDto,
    );

    if (updatedResult.affected === 0) {
      throw new NotFoundException(ERolesErrors.ROLE_NOT_FOUND);
    }

    return {
      message: ERolesSuccess.UPDATE_ROLE,
      data: null,
    };
  }

  async deleteRole(id: string, tenantId: string): Promise<IResponse<null>> {
    const usersCount = await this.rolesRepository.countUsersWithRole(
      id,
      tenantId,
    );

    if (usersCount > 0) {
      throw new ConflictException(ERolesErrors.ROLE_IN_USE);
    }

    const deleteResult = await this.rolesRepository.deleteRole(id, tenantId);

    if (deleteResult.affected === 0) {
      throw new NotFoundException(ERolesErrors.ROLE_NOT_FOUND);
    }

    return {
      message: ERolesSuccess.DELETE_ROLE,
      data: null,
    };
  }
}
