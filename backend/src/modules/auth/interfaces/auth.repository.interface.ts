export interface IAuthRepository {
  findHashPasswordByUsername(username: string): Promise<string | null>;
}
