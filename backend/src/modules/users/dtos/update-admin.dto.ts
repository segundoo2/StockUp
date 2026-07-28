import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsBoolean } from 'class-validator';
import { EUsersErrors } from '../../../enum/users-errors.enum';

export abstract class UpdateAdminDto {
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
    description: 'O admin deve ser booleano.',
    example: 'true = usuário administrador',
  })
  @IsBoolean({ message: EUsersErrors.ADMIN_INVALID })
  @IsNotEmpty({ message: EUsersErrors.ADMIN_INVALID })
  admin!: boolean;
}
