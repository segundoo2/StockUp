import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class AllocateLocationDto {
  @ApiProperty({ description: 'ID do produto (UUID v4)' })
  @IsUUID('4')
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({
    description:
      'ID da localização de origem (null se estiver saindo do estoque geral não alocado)',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4')
  sourceLocationId?: string | null;

  @ApiProperty({ description: 'ID da localização de destino (UUID v4)' })
  @IsUUID('4')
  @IsNotEmpty()
  targetLocationId!: string;

  @ApiProperty({
    description: 'Quantidade a ser alocada ou transferida',
    example: 5,
  })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ description: 'Motivo da movimentação/transferência' })
  @IsOptional()
  @IsString()
  reason?: string;
}
