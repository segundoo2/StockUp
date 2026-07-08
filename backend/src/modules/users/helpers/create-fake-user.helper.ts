import { User } from '../entities/user.entity';

export const createFakeUser = (): Partial<User> => ({
  id: 'some-uuid-or-id',
  username: 'segundo',
  admin: true,
  mustChangePassword: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});
