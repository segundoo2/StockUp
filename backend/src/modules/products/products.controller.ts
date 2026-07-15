import { Controller, Inject } from '@nestjs/common';
import { IProductsController } from './interfaces/products.controller.interface';
import { ProductDto } from './dtos/product.dto';
import { IProductsResponse } from './interfaces/products-response.interface';
import type { IProductsService } from './interfaces/products.service.interface';

@Controller('products')
export class ProductsController implements IProductsController {
  constructor(
    @Inject('IProductsService')
    private readonly productsService: IProductsService,
  ) {}

  async createProduct(
    productDto: ProductDto,
  ): Promise<IProductsResponse<ProductDto | null>> {
    return await this.productsService.createProduct(productDto);
  }
}
