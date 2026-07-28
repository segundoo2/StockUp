import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from './product.entity';

@Entity({ name: 'product_locations' })
@Index(['tenantId', 'locationCode'], { unique: true })
export class ProductLocation {
  @ApiProperty({
    description: 'Identificador único da localização do produto (UUID v4)',
    example: 'f21a48c9-598d-4a14-8789-08226edb3b0d',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Identificador do tenant proprietário',
    example: 'tenant-12345',
  })
  @Column({ type: 'varchar', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @ApiProperty({
    description: 'Código da localização / posição física no estoque',
    example: 'CORREDOR-A-PRATELEIRA-02',
  })
  @Column({ type: 'varchar', name: 'location_code', length: 50 })
  locationCode!: string;

  @ApiPropertyOptional({
    description: 'ID do produto vinculado à localização',
    example: 'd3b07384-d113-424a-a1d2-06834d858348',
    nullable: true,
  })
  @Column({ type: 'uuid', name: 'product_id', nullable: true })
  productId?: string | null;

  @ApiPropertyOptional({
    type: () => Product,
    description: 'Produto armazenado nesta localização',
    nullable: true,
  })
  @ManyToOne(() => Product, (product) => product.locations, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product?: Product | null;

  @ApiProperty({
    description: 'Quantidade estocada nesta localização específica',
    example: 50.0,
    default: 0.0,
    type: Number,
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0.0,
    transformer: {
      to: (value: number): number => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  quantity!: number;

  @ApiProperty({
    description: 'Data de criação da localização',
    example: '2026-07-27T20:00:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({
    description: 'Data da última atualização da localização',
    example: '2026-07-27T20:00:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
