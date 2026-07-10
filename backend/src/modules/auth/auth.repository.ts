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

  async findHashPasswordByUsername(username: string): Promise<string | null> {
    try {
      const passwordHash = await this.repository.findOne({
        where: { username },
        select: { password: true },
      });
      return (passwordHash?.password as string) ?? null;
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }
}
