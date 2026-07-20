import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Product } from '../entities/product.entity';

type CreateProductInput = Omit<
  Product,
  | 'id'
  | 'currentStock'
  | 'locations'
  | 'categoryId'
  | 'category'
  | 'tenantId'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
>;

export class ProductDto implements CreateProductInput {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  sku!: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  name!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice!: number;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  minimumStock!: number;

  @IsString()
  @IsOptional()
  @Length(1, 10)
  uom!: string;

  // --- DADOS FISCAIS (Todos opcionais no cadastro rápido) ---
  @IsString()
  @IsOptional()
  @Length(8, 14)
  ean?: string | null;

  @IsString()
  @IsOptional()
  @Length(8, 8)
  ncm?: string | null;

  @IsString()
  @IsOptional()
  @Length(7, 7)
  cest?: string | null;

  @IsString()
  @IsOptional()
  @Length(1, 1)
  origin!: string;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  csosn?: string | null;

  @IsString()
  @IsOptional()
  @Length(2, 2)
  cst?: string | null;
}
