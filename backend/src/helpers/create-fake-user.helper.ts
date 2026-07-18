import { User } from '../modules/users/entities/user.entity';

export function createFakeUser(): User {
  const user = new User();
  user.id = 'user-uuid-123';
  user.username = 'john.doe';
  user.admin = false;
  return user;
}
