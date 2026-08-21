import { IResponse } from '../../../interfaces/response.interface';
import { EPermission } from '../../../enum/permissions.enum';
import { RoleDto } from '../dtos/role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { Role } from '../entities/role.entity';

export interface IRolesService {
  createRole(roleDto: RoleDto): Promise<IResponse<null>>;
  updateRole(
    id: string,
    tenantId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<IResponse<null>>;
  findById(id: string, tenantId: string): Promise<IResponse<Role>>;
  findAllRoles(tenantId: string): Promise<IResponse<Role[]>>;
  deleteRole(id: string, tenantId: string): Promise<IResponse<null>>;
  listPermissions(): IResponse<EPermission[]>;
  ensureDefaultAdminRole(tenantId: string): Promise<Role>;
  getRoleForTenant(id: string, tenantId: string): Promise<Role>;
}
