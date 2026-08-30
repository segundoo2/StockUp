import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

/**
 * Enum que representa os tipos de movimentação de estoque
 */
export enum EMovementType {
  IN = 'IN',
  OUT = 'OUT',
  POSITION = 'POSITION',
}

/**
 * DTO para registro de movimentação de estoque
 */
export class MovementDto {
  @ApiProperty({
    description: 'Tipo da movimentação (Entrada, Saída ou Ajuste de Posição)',
    enum: EMovementType,
    example: EMovementType.IN,
  })
  @IsEnum(EMovementType, {
    message: 'typeMovement deve ser IN, OUT ou POSITION',
  })
  @IsNotEmpty({ message: 'typeMovement não pode ser vazio' })
  typeMovement!: EMovementType;

  @ApiProperty({
    description: 'ID do produto (UUID v4)',
    example: 'd3b07384-d113-424a-a1d2-06834d858348',
  })
  @IsUUID('4', { message: 'productId deve ser um UUID v4 válido' })
  @IsNotEmpty({ message: 'productId não pode ser vazio' })
  productId!: string;

  @ApiProperty({
    description: 'ID da localização do estoque (UUID v4)',
    example: 'f21a48c9-598d-4a14-8789-08226edb3b0d',
  })
  @IsUUID('4', { message: 'locationId deve ser um UUID v4 válido' })
  @IsNotEmpty({ message: 'locationId não pode ser vazio' })
  locationId!: string;

  @ApiProperty({
    description:
      'Quantidade a ser movimentada (deve ser um inteiro maior que zero)',
    example: 10,
    minimum: 1,
  })
  @IsInt({ message: 'quantity deve ser um número inteiro' })
  @Min(1, { message: 'quantity deve ser no mínimo 1' })
  @IsNotEmpty({ message: 'quantity não pode ser vazia' })
  quantity!: number;

  @ApiPropertyOptional({
    description: 'Motivo ou observação sobre a movimentação',
    example: 'Ajuste referente à nota fiscal de entrada #1234',
  })
  @IsString({ message: 'reason deve ser uma texto' })
  @IsOptional()
  reason?: string;
}
