import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IUsersController } from './interface/users.controller.interface';
import type { IUsersService } from './interface/users.service.interface';
import { ESuccess } from './enum/success.enum';
import { UsersResponseDto } from './dto/users-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController implements IUsersController {
  constructor(
    @Inject('IUsersService') private readonly usersService: IUsersService,
  ) {}

  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: ESuccess.USER_REGISTER,
    type: String,
  })
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<string> {
    return await this.usersService.createUser(createUserDto);
  }

  @Get()
  async findAllUsers(): Promise<UsersResponseDto> {
    return await this.usersService.findAllUsers();
  }

  @ApiOperation({ summary: 'Buscar usuário através do username' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Retorna uma mensagem de status e os dados parciais do usuário (ou null caso não seja encontrado).',
    type: UsersResponseDto,
  })
  @Get(':username')
  async findOneByUsername(
    @Param('username') username: string,
  ): Promise<UsersResponseDto> {
    return await this.usersService.findOneByUsername(username);
  }
}
