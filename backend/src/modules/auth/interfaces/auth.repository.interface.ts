import { User } from '../../users/entities/user.entity';

export interface IAuthRepository {
  findUserByUsername(
    username: string,
  ): Promise<Pick<User, 'id' | 'username' | 'admin' | 'password'> | null>;
}
