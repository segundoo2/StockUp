import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IUsersRepository } from './interfaces/users.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { EErrorsGlobal } from '../../enum/errors-global.enum';
import { UserDto } from './dtos/user.dto';
import { UpdateResult } from 'typeorm/browser';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { UpdateAdminDto } from './dtos/update-admin.dto';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  async createUser(userDto: UserDto): Promise<void> {
    try {
      const user: User = this.repository.create(userDto);
      await this.repository.save(user);
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async updateUserPassword(
    passwordDto: UpdatePasswordDto,
  ): Promise<UpdateResult> {
    try {
      return await this.repository.update(passwordDto.username, {
        password: passwordDto.password,
        mustChangePassword: passwordDto.mustChangePassword,
      });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async updateAdminUser(adminDto: UpdateAdminDto): Promise<UpdateResult> {
    try {
      return await this.repository.update(adminDto.username, {
        admin: adminDto.admin,
      });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findAllUsers(): Promise<Partial<User>[] | null> {
    try {
      const users: Partial<User>[] = await this.repository.find({
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return users.length === 0 ? null : users;
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findOneByUsername(username: string): Promise<User | null> {
    try {
      return await this.repository.findOne({
        where: { username },
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async deleteUser(username: string): Promise<DeleteResult> {
    try {
      return await this.repository.delete(username);
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }
}
