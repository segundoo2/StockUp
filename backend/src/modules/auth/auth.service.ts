import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IAuthService } from './interfaces/auth.service.interface';
import { UserDto } from '../users/dtos/user.dto';
import { ESuccess } from './enums/success.enum';
import type { IAuthRepository } from './interfaces/auth.repository.interface';
import { EErrors } from '../users/enums/errors.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
  ) {}

  async login(
    userDto: Pick<UserDto, 'username' | 'password'>,
  ): Promise<string> {
    const dbUserPasswordHash = await this.getUserPasswordHash(userDto.username);
    await this.comparePasswordHash(
      userDto.password as string,
      dbUserPasswordHash,
    );
    return ESuccess.LOGIN;
  }

  private async getUserPasswordHash(username: string): Promise<string> {
    const userPassword: string | null =
      await this.authRepository.findHashPasswordByUsername(username);
    if (!userPassword) {
      throw new NotFoundException(EErrors.USER_NOT_FOUND);
    }
    return userPassword;
  }

  private async comparePasswordHash(
    userDtoPassword: string,
    dbUserPasswordHash: string,
  ) {
    const isPasswordValid = await bcrypt.compare(
      userDtoPassword,
      dbUserPasswordHash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException(EErrors.PASSWORD_INCORRECT);
    }
  }

  // async logout(username: string): Promise<string> {
  //   return ESuccess.LOGOUT;
  // }
}
