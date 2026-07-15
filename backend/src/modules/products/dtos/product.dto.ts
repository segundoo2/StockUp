import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { Product } from '../entities/product.entity';

type CreateProductInput = Omit<
  Product,
  | 'id'
  | 'currentStock'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'category'
  | 'tenantId'
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

  @IsString()
  @IsOptional()
  @Length(1, 10)
  uom!: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  minimumStock!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice!: number;

  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsOptional()
  @Length(14, 14)
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
