import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsBoolean } from 'class-validator';
import { EErrors } from '../enums/errors.enum';

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
  @IsString({ message: `${EErrors.USERNAME} ${EErrors.CARACTERS_INVALID}` })
  @IsNotEmpty({ message: EErrors.USERNAME_INVALID })
  @Matches(/^[a-z0-9]+(?:\.[a-z0-9]+)+$/, {
    message: EErrors.USERNAME_INVALID,
  })
  username!: string;

  @ApiProperty({
    description: 'O admin deve ser booleano.',
    example: 'true = usuário administrador',
  })
  @IsBoolean({ message: EErrors.ADMIN_INVALID })
  @IsNotEmpty({ message: EErrors.ADMIN_INVALID })
  admin!: boolean;
}
