import { CreateUserDto } from '../dto/create-user.dto';

export interface IUsersRepository {
  create(createUserDto: CreateUserDto): Promise<string>;
}
