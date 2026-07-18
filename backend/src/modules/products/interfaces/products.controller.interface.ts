import { IResponse } from '../../../interfaces/response.interface';
import { ProductDto } from '../dtos/product.dto';
import { Product } from '../entities/product.entity';

export interface IProductsController {
  createProduct(
    productDto: ProductDto,
    tenantId: string,
  ): Promise<IResponse<null>>;
  findOneBySku(sku: string, tenantId: string): Promise<IResponse<Product>>;
  findAllProducts(tenantId: string): Promise<IResponse<Product[]>>;
}
