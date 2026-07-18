import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUsersService } from './interfaces/users.service.interface';
import type { IUsersRepository } from './interfaces/users.repository.interface';
import { User } from './entities/user.entity';
import { EErrors } from './enums/errors.enum';
import { ESuccess } from './enums/success.enum';
import * as generatePassword from 'generate-password';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dtos/user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { UpdateAdminDto } from './dtos/update-admin.dto';
import { UpdateResult } from 'typeorm';
import type { ICacheStorageService } from '../../common/redis/interface/cache-storage.interface';
import { IResponse } from '../../interfaces/response.interface';

@Injectable()
export class UsersService implements IUsersService {
  private readonly SALT_ROUNDS = 10;
  private readonly BLACKLIST_EXPIRATION_SECONDS = 900;

  constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: IUsersRepository,
    @Inject('ICacheStorageService')
    private readonly cacheStorage: ICacheStorageService,
  ) {}

  async createUser(userDto: UserDto): Promise<IResponse<string>> {
    userDto.password = this.generateTemporaryPassword();

    await this.usersRepository.createUser({
      ...userDto,
      password: await bcrypt.hash(userDto.password, this.SALT_ROUNDS),
    });

    return { message: ESuccess.CREATE_USER, data: userDto.password };
  }

  async updateUserPassword(
    passwordDto: UpdatePasswordDto,
  ): Promise<IResponse<string | null>> {
    this.verifyInvalidUsername(passwordDto.username);

    // Se não houver senha, gera uma temporária, senão usa a informada
    const plainPassword =
      passwordDto.password || this.generateTemporaryPassword();

    const passwordUpdated: UpdateResult =
      await this.usersRepository.updateUserPassword({
        ...passwordDto,
        password: await bcrypt.hash(plainPassword, this.SALT_ROUNDS),
      });

    if (passwordUpdated.affected === 0) {
      throw new NotFoundException(EErrors.USER_NOT_FOUND);
    }

    // Retorna a senha em texto claro apenas se ela foi gerada pelo sistema
    const returnData = passwordDto.password ? null : plainPassword;

    return { message: ESuccess.PASSWORD_UPDATE, data: returnData };
  }

  async updateAdminUser(adminDto: UpdateAdminDto): Promise<IResponse<null>> {
    this.verifyInvalidUsername(adminDto.username);

    const result: UpdateResult =
      await this.usersRepository.updateAdminUser(adminDto);
    if (result.affected === 0) {
      throw new NotFoundException(EErrors.ADMIN_INVALID);
    }

    return { message: ESuccess.ADMIN_UPDATE, data: null };
  }

  async findAllUsers(
    tenantId: string,
  ): Promise<IResponse<Omit<User, 'password'>[]>> {
    return {
      message: ESuccess.USERS_FOUND,
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
      throw new NotFoundException(EErrors.USER_NOT_FOUND);
    }

    return {
      message: ESuccess.USER_FOUND,
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
      throw new NotFoundException(EErrors.USER_NOT_FOUND);
    }

    await this.usersRepository.deleteUser(username, tenantId);

    const blockKey = `blacklist:user:${user.id}`;
    await this.cacheStorage.setWithExpiry(
      blockKey,
      'deleted',
      this.BLACKLIST_EXPIRATION_SECONDS,
    );

    return { message: ESuccess.DELETE_USER, data: null };
  }

  // auxiliary methods

  private async getExistingUsersList(
    tenantId: string,
  ): Promise<Omit<User, 'password'>[]> {
    const usersList: Omit<User, 'password'>[] | null =
      await this.usersRepository.findAllUsers(tenantId);
    if (!usersList) {
      throw new NotFoundException(EErrors.USERS_NOT_FOUND);
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
      throw new BadRequestException(EErrors.USERNAME_INVALID);
    }
  }
}
