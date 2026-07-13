import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { RequestWithCookies } from '../interfaces/req-with-cookies.interface';
import { JwtRefreshStrategy } from '../strategies/refresh-token.strategy';

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtRefreshStrategy],
    }).compile();

    strategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the payload when fingerprints match', () => {
      const mockPayload: IJwtPayload = {
        sub: 'user-id-123',
        admin: true,
        username: 'test@example.com',
        fingerprint: 'matched-device', // 👈 Casamento perfeito com o header abaixo
      };

      const mockRequest = {
        headers: {
          'user-agent': 'matched-device',
        },
      } as unknown as RequestWithCookies;

      const result = strategy.validate(mockRequest, mockPayload);
      expect(result).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException when fingerprints mismatch', () => {
      const mockPayload: IJwtPayload = {
        sub: 'user-id-123',
        admin: true,
        username: 'test@example.com',
        fingerprint: 'device-alpha', // 👈 Dispositivo original
      };

      const mockRequest = {
        headers: {
          'user-agent': 'device-omega', // 👈 Tentativa de roubo por outro dispositivo
        },
      } as unknown as RequestWithCookies;

      expect(() => strategy.validate(mockRequest, mockPayload)).toThrow(
        new UnauthorizedException(
          'Dispositivo divergente. Acesso negado por motivos de segurança.',
        ),
      );
    });
  });
});
