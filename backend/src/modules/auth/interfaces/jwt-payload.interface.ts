export interface IJwtPayload {
  sub: string;
  username: string;
  admin: boolean;
  fingerprint: string;
}

export interface IJwtPayloadWithExpiry extends IJwtPayload {
  exp: number;
}
