import { IResponse } from '../../../interfaces/response.interface';
import { ProductDto } from '../dtos/product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { Product } from '../entities/product.entity';

export interface IProductsService {
  createProduct(
    productDto: ProductDto & { tenantId: string },
  ): Promise<IResponse<null>>;

  updateProduct(
    updateProductDto: UpdateProductDto,
    id: string,
    tenantId: string,
  ): Promise<IResponse<null>>;

  applyStockDelta(
    ProductId: string,
    tenantId: string,
    delta: number,
  ): Promise<IResponse<null>>;

  findOneBySku(sku: string, tenantId: string): Promise<IResponse<Product>>;

  findAllProducts(tenantId: string): Promise<IResponse<Product[]>>;

  deleteProduct(sku: string, tenantId: string): Promise<IResponse<null>>;
}
