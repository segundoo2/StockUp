import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { IRolesRepository } from './interfaces/roles.repository.interface';
import { Role } from './entities/role.entity';
import { User } from '../users/entities/user.entity';
import { RoleDto } from './dtos/role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { EErrorsGlobal } from '../../enum/errors-global.enum';
import {
  ALL_PERMISSIONS,
  SYSTEM_ADMIN_ROLE_NAME,
} from '../../enum/permissions.enum';

@Injectable()
export class RolesRepository implements IRolesRepository {
  constructor(
    @InjectRepository(Role) private readonly repository: Repository<Role>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createRole(
    roleDto: RoleDto & { isSystem?: boolean },
  ): Promise<Role> {
    try {
      const role = this.repository.create({
        ...roleDto,
        isSystem: roleDto.isSystem ?? false,
      });
      return await this.repository.save(role);
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async updateRole(
    id: string,
    tenantId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<UpdateResult> {
    try {
      return await this.repository.update({ id, tenantId }, updateRoleDto);
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findById(id: string, tenantId: string): Promise<Role | null> {
    try {
      return await this.repository.findOne({ where: { id, tenantId } });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findByName(name: string, tenantId: string): Promise<Role | null> {
    try {
      return await this.repository.findOne({ where: { name, tenantId } });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findAllRoles(tenantId: string): Promise<Role[]> {
    try {
      return await this.repository.find({ where: { tenantId } });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async deleteRole(id: string, tenantId: string): Promise<DeleteResult> {
    try {
      return await this.repository.delete({ id, tenantId });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async countUsersByRoleId(roleId: string, tenantId: string): Promise<number> {
    try {
      return await this.userRepository.count({ where: { roleId, tenantId } });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async ensureDefaultAdminRole(tenantId: string): Promise<Role> {
    const existing = await this.findByName(SYSTEM_ADMIN_ROLE_NAME, tenantId);
    if (existing) {
      return existing;
    }

    return await this.createRole({
      tenantId,
      name: SYSTEM_ADMIN_ROLE_NAME,
      permissions: ALL_PERMISSIONS,
      isSystem: true,
    });
  }
}
