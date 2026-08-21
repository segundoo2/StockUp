import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsUUID } from 'class-validator';
import { EUsersErrors } from '../../../enum/users-errors.enum';

export abstract class UpdateUserRoleDto {
  @ApiProperty({
    description: 'Id da empresa no qual o usuário pertence',
    example: 'uuid',
  })
  tenantId!: string;

  @ApiProperty({
    description: 'Nome do usuário deve está no formato: nome.sobrenome',
    example: 'edilson.segundo',
  })
  @IsString({
    message: `${EUsersErrors.USERNAME} ${EUsersErrors.CARACTERS_INVALID}`,
  })
  @IsNotEmpty({ message: EUsersErrors.USERNAME_INVALID })
  @Matches(/^[a-z0-9]+(?:\.[a-z0-9]+)+$/, {
    message: EUsersErrors.USERNAME_INVALID,
  })
  username!: string;

  @ApiProperty({
    description: 'Identificador da nova role do usuário',
    example: 'c22e5a7d-b2b2-4d76-8809-51a81231f24d',
  })
  @IsUUID('4', { message: EUsersErrors.ROLE_INVALID })
  @IsNotEmpty({ message: EUsersErrors.ROLE_INVALID })
  roleId!: string;
}
