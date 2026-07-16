import { ProductDto } from '../dtos/product.dto';
import { Product } from '../entities/product.entity';
import { IProductsResponse } from './products-response.interface';

export interface IProductsController {
  createProduct(
    productDto: ProductDto,
  ): Promise<IProductsResponse<ProductDto | null>>;
  findOneBySku(sku: string): Promise<IProductsResponse<Product | null>>;
}
