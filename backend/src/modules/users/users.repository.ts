import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IUsersRepository } from './interfaces/users.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import {
  DeleteResult,
  QueryFailedError,
  Repository,
  UpdateResult,
} from 'typeorm';
import { EErrorsGlobal } from '../../enum/errors-global.enum';
import { UserDto } from './dtos/user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { UpdateAdminDto } from './dtos/update-admin.dto';
import { IDatabaseDriverError } from '../../interfaces/database-driver-Error.interface';
import { EUsersErrors } from '../../enum/users-errors.enum';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  async createUser(userDto: UserDto): Promise<void> {
    try {
      const user: User = this.repository.create(userDto);
      await this.repository.save(user);
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as IDatabaseDriverError;
        const errorCode = driverError.code;

        if (errorCode === '23505') {
          throw new ConflictException(EUsersErrors.USERNAME_EXIST);
        }
      }
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async updateUserPassword(
    passwordDto: UpdatePasswordDto,
  ): Promise<UpdateResult> {
    try {
      return await this.repository.update(
        { username: passwordDto.username, tenantId: passwordDto.tenantId },
        {
          password: passwordDto.password,
          mustChangePassword: passwordDto.mustChangePassword,
        },
      );
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async updateAdminUser(adminDto: UpdateAdminDto): Promise<UpdateResult> {
    try {
      return await this.repository.update(
        { username: adminDto.username, tenantId: adminDto.tenantId },
        {
          admin: adminDto.admin,
        },
      );
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findAllUsers(
    tenantId: string,
  ): Promise<Omit<User, 'password'>[] | null> {
    try {
      const users: Omit<User, 'password'>[] = await this.repository.find({
        where: {
          tenantId,
        },
        select: {
          id: true,
          username: true,
          admin: true,
          mustChangePassword: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return users.length === 0 ? null : users;
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findOneByUsername(
    username: string,
    tenantId: string,
  ): Promise<Omit<User, 'password'> | null> {
    try {
      return await this.repository.findOne({
        where: { username, tenantId },
        select: {
          id: true,
          username: true,
          admin: true,
          mustChangePassword: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async deleteUser(username: string, tenantId: string): Promise<DeleteResult> {
    try {
      return await this.repository.delete({ username, tenantId });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }
}
