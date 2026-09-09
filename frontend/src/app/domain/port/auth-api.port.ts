import { AuthCredentialsModel, IAuthResponseModel } from '../model/auth.model';

export interface IAuthApiPort {
  login(credentials: AuthCredentialsModel): Promise<IAuthResponseModel>;
  refresh(): Promise<IAuthResponseModel>;
  logout(): Promise<IAuthResponseModel>;
}