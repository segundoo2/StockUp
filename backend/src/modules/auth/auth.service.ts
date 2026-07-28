import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import {
  IJwtPayload,
  IJwtPayloadWithExpiry,
} from './interfaces/jwt-payload.interface';
import type {
  ITokenService,
  TokenDuration,
} from './interfaces/jwt-service.interface';
import type { IAuthRepository } from './interfaces/auth.repository.interface';
import type { IAuthService } from './interfaces/auth.service.interface';
import { EAuthSuccess } from '../../enum/auth-success.enum';
import { RedisService } from '../../common/redis/redis.service';
import { IAuthPayload } from './interfaces/auth-payload.interface';
import * as bcrypt from 'bcrypt';
import { EAuthErrors } from '../../enum/auth-errors.enum';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('ITokenService') private readonly tokenService: ITokenService,
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    private readonly redisService: RedisService,
  ) {}

  async login(loginDto: LoginDto, fingerprint: string): Promise<IAuthPayload> {
    const user = await this.authRepository.findUserByUsername(
      loginDto.username,
      loginDto.tenantId,
    );
    if (!user) {
      throw new UnauthorizedException(EAuthErrors.USER_NOT_FOUND);
    }

    await this.validatePassword(loginDto.password, user.password);

    const payload: IJwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      username: user.username,
      admin: user.admin,
      fingerprint,
    };
    const tokens = await this.generateTokenPair(payload);

    return {
      message: EAuthSuccess.LOGIN,
      data: tokens,
    };
  }

  async refresh(
    payload: IJwtPayloadWithExpiry,
    currentFingerprint: string,
  ): Promise<IAuthPayload> {
    const user = await this.authRepository.findUserByUsername(
      payload.username,
      payload.tenantId,
    );

    if (!user) {
      throw new UnauthorizedException(EAuthErrors.FAILED_RETRIEVE_SESSION);
    }

    const ttlSeconds = this.calculateTtlSeconds(payload.exp);

    if (ttlSeconds > 0) {
      const blacklistKey = `blacklist:refresh:${payload.sub}:${payload.exp}`;
      await this.redisService.setWithExpiry(
        blacklistKey,
        'rotated',
        ttlSeconds,
      );
    }

    const newPayload: IJwtPayload = {
      sub: payload.sub,
      tenantId: payload.tenantId,
      username: payload.username,
      admin: payload.admin,
      fingerprint: currentFingerprint,
    };
    const tokens = await this.generateTokenPair(newPayload);

    return {
      message: EAuthSuccess.REFRESH,
      data: tokens,
    };
  }

  async logout(
    payload: IJwtPayloadWithExpiry,
  ): Promise<{ message: EAuthSuccess }> {
    const ttlSeconds = this.calculateTtlSeconds(payload.exp);

    if (ttlSeconds > 0) {
      const blacklistKey = `blacklist:refresh:${payload.sub}:${payload.exp}`;
      await this.redisService.setWithExpiry(
        blacklistKey,
        'revoked',
        ttlSeconds,
      );
    }

    return { message: EAuthSuccess.LOGOUT };
  }

  // ==========================================
  // MÉTODOS AUXILIARES (Isolamento de Funções)
  // ==========================================

  private async validatePassword(
    password: string,
    hash: string,
  ): Promise<void> {
    const isPasswordValid = await bcrypt.compare(password, hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta.');
    }
  }

  private async generateTokenPair(
    payload: IJwtPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.tokenService.signAsync(payload, {
      expiresIn:
        (process.env.ACCESS_TOKEN_EXPIRES_IN as TokenDuration) || '15m',
    });

    const refreshToken = await this.tokenService.signAsync(payload, {
      expiresIn:
        (process.env.REFRESH_TOKEN_EXPIRES_IN as TokenDuration) || '7d',
    });

    return { accessToken, refreshToken };
  }

  private calculateTtlSeconds(exp: number): number {
    const nowSeconds = Math.floor(Date.now() / 1000);
    return exp - nowSeconds;
  }
}
