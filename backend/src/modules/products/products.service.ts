import { Inject, Injectable } from '@nestjs/common';
import type { IProductsRepository } from './interfaces/products.repository.interface';
import { IProductsService } from './interfaces/products.service.interface';
import { ProductDto } from './dtos/product.dto';
import { IProductsResponse } from './interfaces/products-response.interface';

@Injectable()
export class ProductsService implements IProductsService {
  constructor(
    @Inject('IProductsRepository')
    private readonly productsRepository: IProductsRepository,
  ) {}

  createProduct(productDto: ProductDto): Promise<IProductsResponse<null>> {
    
  }
}
