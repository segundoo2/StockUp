import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { RequestWithCookies } from '../interfaces/req-with-cookies.interface';
import { JwtStrategy, cookieJwtExtractor } from '../strategies/jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('jwtFromRequest (Extractor)', () => {
    it('should extract access_token from cookies', () => {
      const mockRequest = {
        cookies: {
          access_token: 'valid-access-token',
        },
      } as unknown as RequestWithCookies;

      const result = cookieJwtExtractor(mockRequest);
      expect(result).toBe('valid-access-token');
    });
  });

  describe('validate', () => {
    it('should return the payload when valid', () => {
      const mockPayload: IJwtPayload = {
        sub: 'user-id-123',
        admin: true,
        username: 'user.name',
        fingerprint: 'any-fingerprint', // 👈 Adicionado
      };
      const result = strategy.validate(mockPayload);
      expect(result).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException when payload is null or undefined', () => {
      expect(() => strategy.validate(null as unknown as IJwtPayload)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
