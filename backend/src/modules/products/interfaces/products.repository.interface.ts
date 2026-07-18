import { ProductDto } from '../dtos/product.dto';
import { Product } from '../entities/product.entity';

export interface IProductsRepository {
  createProduct(productDto: ProductDto): Promise<Product>;
  findOneBySku(sku: string, tenantId: string): Promise<Product | null>;
}
