import { EPermission } from '../../../enum/permissions.enum';

export interface IJwtPayload {
  sub: string;
  tenantId: string;
  username: string;
  roleId: string;
  permissions: EPermission[];
  fingerprint: string;
}

export interface IJwtPayloadWithExpiry extends IJwtPayload {
  exp: number;
  iat?: number;
}
