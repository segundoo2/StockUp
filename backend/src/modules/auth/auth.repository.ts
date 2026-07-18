import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IAuthRepository } from './interfaces/auth.repository.interface';
import { EErrorsGlobal } from '../../enum/errors-global.enum';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findUserByUsername(
    username: string,
    tenantId: string,
  ): Promise<Pick<
    User,
    'id' | 'tenantId' | 'username' | 'admin' | 'password'
  > | null> {
    try {
      return (
        (await this.repository.findOne({
          where: { username, tenantId },
          select: {
            id: true,
            tenantId: true,
            username: true,
            admin: true,
            password: true,
          },
        })) ?? null
      );
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }
}
