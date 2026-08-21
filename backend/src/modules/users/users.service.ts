import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUsersService } from './interfaces/users.service.interface';
import type { IUsersRepository } from './interfaces/users.repository.interface';
import { User } from './entities/user.entity';
import * as generatePassword from 'generate-password';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dtos/user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';
import { UpdateResult } from 'typeorm';
import type { ICacheStorageService } from '../../common/redis/interface/cache-storage.interface';
import type { IRolesService } from '../roles/interfaces/roles.service.interface';
import { IResponse } from '../../interfaces/response.interface';
import { EUsersSuccess } from '../../enum/users-sucess.enum';
import { EUsersErrors } from '../../enum/users-errors.enum';

@Injectable()
export class UsersService implements IUsersService {
  private readonly SALT_ROUNDS = 10;
  private readonly BLACKLIST_EXPIRATION_SECONDS = 900;

  constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: IUsersRepository,
    @Inject('ICacheStorageService')
    private readonly cacheStorage: ICacheStorageService,
    @Inject('IRolesService')
    private readonly rolesService: IRolesService,
  ) {}

  async createUser(userDto: UserDto): Promise<IResponse<string>> {
    await this.rolesService.ensureDefaultAdminRole(userDto.tenantId);
    await this.rolesService.getRoleForTenant(userDto.roleId, userDto.tenantId);

    userDto.password = this.generateTemporaryPassword();

    await this.usersRepository.createUser({
      ...userDto,
      password: await bcrypt.hash(userDto.password, this.SALT_ROUNDS),
    });

    return { message: EUsersSuccess.CREATE_USER, data: userDto.password };
  }

  async updateUserPassword(
    passwordDto: UpdatePasswordDto,
  ): Promise<IResponse<string | null>> {
    this.verifyInvalidUsername(passwordDto.username);

    const plainPassword =
      passwordDto.password || this.generateTemporaryPassword();

    const passwordUpdated: UpdateResult =
      await this.usersRepository.updateUserPassword({
        ...passwordDto,
        password: await bcrypt.hash(plainPassword, this.SALT_ROUNDS),
      });

    if (passwordUpdated.affected === 0) {
      throw new NotFoundException(EUsersErrors.USER_NOT_FOUND);
    }

    const returnData = passwordDto.password ? null : plainPassword;

    return { message: EUsersSuccess.PASSWORD_UPDATE, data: returnData };
  }

  async updateUserRole(roleDto: UpdateUserRoleDto): Promise<IResponse<null>> {
    this.verifyInvalidUsername(roleDto.username);
    await this.rolesService.getRoleForTenant(roleDto.roleId, roleDto.tenantId);

    const result: UpdateResult =
      await this.usersRepository.updateUserRole(roleDto);
    if (result.affected === 0) {
      throw new NotFoundException(EUsersErrors.USER_NOT_FOUND);
    }

    return { message: EUsersSuccess.ROLE_UPDATE, data: null };
  }

  async findAllUsers(
    tenantId: string,
  ): Promise<IResponse<Omit<User, 'password'>[]>> {
    return {
      message: EUsersSuccess.USERS_FOUND,
      data: await this.getExistingUsersList(tenantId),
    };
  }

  async findOneByUsername(
    username: string,
    tenantId: string,
  ): Promise<IResponse<Omit<User, 'password'>>> {
    this.verifyInvalidUsername(username);

    const user = await this.usersRepository.findOneByUsername(
      username,
      tenantId,
    );
    if (!user) {
      throw new NotFoundException(EUsersErrors.USER_NOT_FOUND);
    }

    return {
      message: EUsersSuccess.USER_FOUND,
      data: user,
    };
  }

  async deleteUser(
    username: string,
    tenantId: string,
  ): Promise<IResponse<null>> {
    this.verifyInvalidUsername(username);

    const user: Partial<User> | null =
      await this.usersRepository.findOneByUsername(username, tenantId);
    if (!user || !user.id) {
      throw new NotFoundException(EUsersErrors.USER_NOT_FOUND);
    }

    await this.usersRepository.deleteUser(username, tenantId);

    const blockKey = `blacklist:user:${user.id}`;
    await this.cacheStorage.setWithExpiry(
      blockKey,
      'deleted',
      this.BLACKLIST_EXPIRATION_SECONDS,
    );

    return { message: EUsersSuccess.DELETE_USER, data: null };
  }

  private async getExistingUsersList(
    tenantId: string,
  ): Promise<Omit<User, 'password'>[]> {
    const usersList: Omit<User, 'password'>[] | null =
      await this.usersRepository.findAllUsers(tenantId);
    if (!usersList) {
      throw new NotFoundException(EUsersErrors.USERS_NOT_FOUND);
    }
    return usersList;
  }

  private generateTemporaryPassword(): string {
    return generatePassword.generate({
      length: 8,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
      strict: true,
    });
  }

  private verifyInvalidUsername(username: string): void {
    if (!username || username.trim() === '') {
      throw new BadRequestException(EUsersErrors.USERNAME_INVALID);
    }
  }
}
