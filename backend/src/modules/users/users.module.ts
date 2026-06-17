import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [{ provide: 'IUsersService', useClass: UsersService }],
})
export class UsersModule {}
