import { ApiProperty } from '@nestjs/swagger';

export abstract class LoginDto {
  @ApiProperty({ example: 'segundo' })
  username!: string;

  @ApiProperty({ example: '12345678' })
  password!: string;
}
