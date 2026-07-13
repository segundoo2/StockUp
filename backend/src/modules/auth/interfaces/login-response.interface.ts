interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginResponse {
  message: string;
  data: ITokens;
}
