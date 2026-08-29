import { DeleteResult, UpdateResult } from 'typeorm';
import { ProductDto } from '../dtos/product.dto';
import { Product } from '../entities/product.entity';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { PaginationQueryDto } from '../../../common/dtos/pagination-query.dto';

export interface IProductsRepository {
  createProduct(
    productDto: ProductDto & { tenantId: string },
  ): Promise<Product>;
  updateProduct(
    updateProductDto: UpdateProductDto,
    id: string,
    tenantId: string,
  ): Promise<UpdateResult>;
  updateCurrentStockById(
    productId: string,
    tenantId: string,
    newCurrentStock: number,
  ): Promise<UpdateResult>;
  findOneCurrentStockById(
    id: string,
    tenantId: string,
  ): Promise<Pick<Product, 'currentStock' | 'uom'> | null>;
  findOneBySku(sku: string, tenantId: string): Promise<Product | null>;
  findAllProducts(
    tenantId: string,
    pagination: PaginationQueryDto,
  ): Promise<[Product[], number]>;
  deleteProduct(sku: string, tenantId: string): Promise<DeleteResult>;
}
