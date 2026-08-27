import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  In,
  QueryFailedError,
  Repository,
  UpdateResult,
} from 'typeorm';
import { IRolesRepository } from './interfaces/roles.repository.interface';
import { Role } from './entities/role.entity';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { EErrorsGlobal } from '../../enum/errors-global.enum';
import { ERolesErrors } from '../../enum/roles-errors.enum';
import { IDatabaseDriverError } from '../../interfaces/database-driver-Error.interface';
import { RoleDto } from './dtos/role.dto';

@Injectable()
export class RolesRepository implements IRolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {}

  async createRole(roleDto: RoleDto): Promise<Role> {
    try {
      const role = this.repository.create(roleDto);
      return await this.repository.save(role);
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as IDatabaseDriverError;
        if (driverError.code === '23505') {
          throw new ConflictException(ERolesErrors.ROLE_EXIST);
        }
      }
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findAllRoles(tenantId: string): Promise<Role[] | null> {
    try {
      const roles = await this.repository.find({ where: { tenantId } });
      return roles.length === 0 ? null : roles;
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findRoleById(id: string, tenantId: string): Promise<Role | null> {
    try {
      return await this.repository.findOne({ where: { id, tenantId } });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findRolesByIds(ids: string[], tenantId: string): Promise<Role[]> {
    try {
      return await this.repository.find({
        where: { id: In(ids), tenantId },
      });
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

  async deleteRole(id: string, tenantId: string): Promise<DeleteResult> {
    try {
      return await this.repository.delete({ id, tenantId });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async countUsersWithRole(roleId: string, tenantId: string): Promise<number> {
    try {
      return await this.repository
        .createQueryBuilder('role')
        .leftJoin('role.users', 'user')
        .where('role.id = :roleId', { roleId })
        .andWhere('role.tenantId = :tenantId', { tenantId })
        .andWhere('user.id IS NOT NULL')
        .getCount();
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }
}
