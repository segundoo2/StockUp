import { UpdateRoleDto } from '../dtos/update-role.dto';
import { Role } from '../entities/role.entity';
import { IResponse } from '../../../interfaces/response.interface';
import { RoleDto } from '../dtos/role.dto';

export interface IRolesService {
  createRole(roleDto: RoleDto): Promise<IResponse<Role>>;

  findAllRoles(tenantId: string): Promise<IResponse<Role[]>>;

  findRoleById(id: string, tenantId: string): Promise<IResponse<Role>>;

  updateRole(
    id: string,
    tenantId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<IResponse<null>>;

  deleteRole(id: string, tenantId: string): Promise<IResponse<null>>;
}
