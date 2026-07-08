import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { EErrors } from '../enum/errors.enum';

export abstract class UpdateAdminDto {
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
  @IsString({ message: `${EErrors.ROLE} ${EErrors.CARACTERS_INVALID}` })
  @IsNotEmpty({ message: EErrors.ROLE_INVALID })
  admin!: boolean;
}
