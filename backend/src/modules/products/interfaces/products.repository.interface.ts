import { DeleteResult, UpdateResult } from 'typeorm';
import { ProductDto } from '../dtos/product.dto';
import { Product } from '../entities/product.entity';
import { UpdateProductDto } from '../dtos/update-product.dto';

export interface IProductsRepository {
  createProduct(productDto: ProductDto): Promise<Product>;

  updateProduct(
    updateProductDto: UpdateProductDto,
    id: string,
    tenantId: string,
  ): Promise<UpdateResult>;

  findOneBySku(sku: string, tenantId: string): Promise<Product | null>;

  findAllProducts(tenantId: string): Promise<Product[] | []>;

  deleteProduct(sku: string, tenantId: string): Promise<DeleteResult>;
}
