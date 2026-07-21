import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { ProductDto } from './product.dto';

export class UpdateProductDto extends PartialType(ProductDto) {
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;
}
