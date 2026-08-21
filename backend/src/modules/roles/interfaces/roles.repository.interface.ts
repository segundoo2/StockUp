import { DeleteResult, UpdateResult } from 'typeorm';
import { Role } from '../entities/role.entity';
import { RoleDto } from '../dtos/role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';

export interface IRolesRepository {
  createRole(roleDto: RoleDto & { isSystem?: boolean }): Promise<Role>;
  updateRole(
    id: string,
    tenantId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<UpdateResult>;
  findById(id: string, tenantId: string): Promise<Role | null>;
  findByName(name: string, tenantId: string): Promise<Role | null>;
  findAllRoles(tenantId: string): Promise<Role[]>;
  deleteRole(id: string, tenantId: string): Promise<DeleteResult>;
  countUsersByRoleId(roleId: string, tenantId: string): Promise<number>;
  ensureDefaultAdminRole(tenantId: string): Promise<Role>;
}
