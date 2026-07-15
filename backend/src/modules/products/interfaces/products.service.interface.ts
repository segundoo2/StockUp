import { ProductDto } from '../dtos/product.dto';
import { IProductsResponse } from './products-response.interface';

export interface IProductsService {
  createProduct(
    productDto: ProductDto,
  ): Promise<IProductsResponse<ProductDto | null>>;
}
