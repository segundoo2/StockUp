/* eslint-disable @typescript-eslint/unbound-method */
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateResult, DeleteResult } from 'typeorm';
import { RolesService } from '../roles.service';
import { IRolesRepository } from '../interfaces/roles.repository.interface';
import { RoleDto } from '../dtos/role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { Role } from '../entities/role.entity';
import { ERolesSuccess } from '../../../enum/roles-success.enum';
import { ERolesErrors } from '../../../enum/roles-errors.enum';

describe('RolesService', () => {
  let service: RolesService;
  let mockRepository: jest.Mocked<IRolesRepository>;

  const tenantId = 'tenant-uuid-123';
  const roleId = 'role-uuid-456';

  const mockRole: Role = {
    id: roleId,
    name: 'ADMIN',
    tenantId,
    permissions: [],
    users: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const roleDto: RoleDto = {
    tenantId,
    name: 'ADMIN',
    permissions: [],
  };

  const updateRoleDto: UpdateRoleDto = {
    name: 'SUPER_ADMIN',
  };

  beforeEach(async () => {
    mockRepository = {
      createRole: jest.fn(),
      findAllRoles: jest.fn(),
      findRoleById: jest.fn(),
      findRolesByIds: jest.fn(),
      updateRole: jest.fn(),
      deleteRole: jest.fn(),
      countUsersWithRole: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: 'IRolesRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  describe('createRole', () => {
    it('should create and return role successfully', async () => {
      mockRepository.createRole.mockResolvedValue(mockRole);

      const result = await service.createRole(roleDto);

      expect(result).toEqual({
        message: ERolesSuccess.CREATE_ROLE,
        data: mockRole,
      });
      expect(mockRepository.createRole).toHaveBeenCalledWith(roleDto);
    });
  });

  describe('findAllRoles', () => {
    it('should return all roles when found', async () => {
      const rolesMock = [mockRole];
      mockRepository.findAllRoles.mockResolvedValue(rolesMock);

      const result = await service.findAllRoles(tenantId);

      expect(result).toEqual({
        message: ERolesSuccess.ROLES_FOUND,
        data: rolesMock,
      });
      expect(mockRepository.findAllRoles).toHaveBeenCalledWith(tenantId);
    });

    it('should throw NotFoundException when repository returns null', async () => {
      mockRepository.findAllRoles.mockResolvedValue(null);

      await expect(service.findAllRoles(tenantId)).rejects.toThrow(
        new NotFoundException(ERolesErrors.ROLES_NOT_FOUND),
      );
    });
  });

  describe('findRoleById', () => {
    it('should return role when matching ID exists', async () => {
      mockRepository.findRoleById.mockResolvedValue(mockRole);

      const result = await service.findRoleById(roleId, tenantId);

      expect(result).toEqual({
        message: ERolesSuccess.ROLE_FOUND,
        data: mockRole,
      });
      expect(mockRepository.findRoleById).toHaveBeenCalledWith(
        roleId,
        tenantId,
      );
    });

    it('should throw NotFoundException when role does not exist', async () => {
      mockRepository.findRoleById.mockResolvedValue(null);

      await expect(service.findRoleById(roleId, tenantId)).rejects.toThrow(
        new NotFoundException(ERolesErrors.ROLE_NOT_FOUND),
      );
    });
  });

  describe('updateRole', () => {
    const successResult: UpdateResult = {
      raw: [],
      affected: 1,
      generatedMaps: [],
    };

    it('should update role successfully when affected > 0', async () => {
      mockRepository.updateRole.mockResolvedValue(successResult);

      const result = await service.updateRole(roleId, tenantId, updateRoleDto);

      expect(result).toEqual({
        message: ERolesSuccess.UPDATE_ROLE,
        data: null,
      });
      expect(mockRepository.updateRole).toHaveBeenCalledWith(
        roleId,
        tenantId,
        updateRoleDto,
      );
    });

    it('should throw NotFoundException when affected is 0', async () => {
      mockRepository.updateRole.mockResolvedValue({
        ...successResult,
        affected: 0,
      });

      await expect(
        service.updateRole(roleId, tenantId, updateRoleDto),
      ).rejects.toThrow(new NotFoundException(ERolesErrors.ROLE_NOT_FOUND));
    });
  });

  describe('deleteRole', () => {
    const successResult: DeleteResult = { raw: [], affected: 1 };

    it('should delete role successfully when not in use and affected > 0', async () => {
      mockRepository.countUsersWithRole.mockResolvedValue(0);
      mockRepository.deleteRole.mockResolvedValue(successResult);

      const result = await service.deleteRole(roleId, tenantId);

      expect(result).toEqual({
        message: ERolesSuccess.DELETE_ROLE,
        data: null,
      });
      expect(mockRepository.countUsersWithRole).toHaveBeenCalledWith(
        roleId,
        tenantId,
      );
      expect(mockRepository.deleteRole).toHaveBeenCalledWith(roleId, tenantId);
    });

    it('should throw ConflictException when role is assigned to users', async () => {
      mockRepository.countUsersWithRole.mockResolvedValue(2);

      await expect(service.deleteRole(roleId, tenantId)).rejects.toThrow(
        new ConflictException(ERolesErrors.ROLE_IN_USE),
      );
      expect(mockRepository.deleteRole).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when role does not exist', async () => {
      mockRepository.countUsersWithRole.mockResolvedValue(0);
      mockRepository.deleteRole.mockResolvedValue({
        ...successResult,
        affected: 0,
      });

      await expect(service.deleteRole(roleId, tenantId)).rejects.toThrow(
        new NotFoundException(ERolesErrors.ROLE_NOT_FOUND),
      );
    });
  });
});
