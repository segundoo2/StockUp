import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { RequestWithCookies } from '../interfaces/req-with-cookies.interface';
import {
  JwtRefreshStrategy,
  cookieRefreshExtractor,
} from '../strategies/refresh-token.strategy';

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

  describe('jwtFromRequest (Extractor)', () => {
    it('should extract refresh_token from cookies', () => {
      const mockRequest = {
        cookies: {
          refresh_token: 'valid-refresh-token',
        },
      } as unknown as RequestWithCookies;

      const result = cookieRefreshExtractor(mockRequest);
      expect(result).toBe('valid-refresh-token');
    });

    it('should return null if refresh_token is missing', () => {
      const mockRequest = {
        cookies: {},
      } as unknown as RequestWithCookies;

      const result = cookieRefreshExtractor(mockRequest);
      expect(result).toBeNull();
    });
  });

  describe('validate', () => {
    it('should return the payload when valid', () => {
      const mockPayload: IJwtPayload = {
        sub: 'user-id-123',
        admin: true,
        username: 'test@example.com',
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
