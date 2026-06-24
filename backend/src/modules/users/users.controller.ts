import { Controller, Post, Body, Inject, Get, Param } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { IUsersController } from './interface/users.controller.interface';
import type { IUsersService } from './interface/users.service.interface';
import { User } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController implements IUsersController {
  constructor(
    @Inject('IUsersService') private readonly usersService: IUsersService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<string> {
    return this.usersService.create(createUserDto);
  }

  @Get(':username')
  async findOneByUsername(
    @Param('username') username: string,
  ): Promise<Partial<User> | null> {
    return await this.usersService.findOneByUsername(username);
  }
}
