import { ApiProperty } from '@nestjs/swagger';

class AuthTokensDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsIn...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsIn...' })
  refreshToken!: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'Operação realizada com sucesso!' })
  message!: string;

  @ApiProperty({ type: AuthTokensDto })
  data!: AuthTokensDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: 'Logout realizado com sucesso!' })
  message!: string;
}
