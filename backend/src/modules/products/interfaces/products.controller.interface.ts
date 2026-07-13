import { ProductDto } from '../dtos/product.dto';
import { IProductsResponse } from './products-response.interface';

export interface IProductsController {
  createProduct(productDto: ProductDto): Promise<IProductsResponse<null>>;
}
