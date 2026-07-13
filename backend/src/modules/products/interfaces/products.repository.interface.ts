import { ProductDto } from '../dtos/product.dto';
import { IProductsResponse } from './products-response.interface';

export interface IProductsRepository {
  createProduct(productDto: ProductDto): Promise<IProductsResponse<null>>;
}
