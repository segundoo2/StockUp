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
import { User } from '../users/entities/user.entity';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import type {
  ITokenService,
  TokenDuration,
} from './interfaces/jwt-service.interface';
import { IAuthPayload } from './interfaces/login-response.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    @Inject('ITokenService')
    private readonly jwtService: ITokenService,
  ) {}

  async login(
    userDto: Pick<UserDto, 'username' | 'password'>,
  ): Promise<IAuthPayload> {
    const user: Pick<User, 'id' | 'username' | 'password' | 'admin'> =
      await this.findUserByUsername(userDto.username);
    await this.comparePasswordHash(userDto.password as string, user.password);

    return {
      message: ESuccess.LOGIN,
      data: {
        accessToken: await this.generateToken(
          { id: user.id, username: user.username, admin: user.admin },
          process.env.ACCESS_TOKEN_EXPIRES_IN as TokenDuration,
        ),
        refreshToken: await this.generateToken(
          { id: user.id, username: user.username, admin: user.admin },
          process.env.REFRESH_TOKEN_EXPIRES_IN as TokenDuration,
        ),
      },
    };
  }

  private async generateToken(
    user: Pick<User, 'id' | 'username' | 'admin'>,
    expiresIn: TokenDuration,
  ): Promise<string> {
    const payload: IJwtPayload = {
      sub: user.id,
      username: user.username,
      admin: user.admin,
    };
    return await this.jwtService.signAsync(payload, { expiresIn });
  }

  private async findUserByUsername(
    username: string,
  ): Promise<Pick<User, 'id' | 'username' | 'admin' | 'password'>> {
    const user: Pick<User, 'id' | 'username' | 'admin' | 'password'> | null =
      await this.authRepository.findUserByUsername(username);
    if (!user) {
      throw new NotFoundException(EErrors.USER_NOT_FOUND);
    }
    return user;
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
}
