import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ELocationType, Location } from '../entities/location.entity';

export type CreateLocationInput = Omit<
  Location,
  'id' | 'tenantId' | 'productLocations' | 'createdAt' | 'updatedAt'
>;

export class LocationDto implements CreateLocationInput {
  @ApiProperty({
    description: 'Código ou endereço físico da localização no estoque',
    example: 'CORREDOR-A-PRATELEIRA-02',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @ApiPropertyOptional({
    enum: ELocationType,
    description: 'Tipo da localização (DISPLAY ou STORAGE)',
    example: ELocationType.STORAGE,
    default: ELocationType.STORAGE,
  })
  @IsEnum(ELocationType)
  @IsOptional()
  type!: ELocationType;

  @ApiPropertyOptional({
    description: 'Descrição opcional ou observações sobre a localização',
    example: 'Área refrigerada para produtos perecíveis',
    maxLength: 255,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string | null;
}
