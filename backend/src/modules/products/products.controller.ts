import { Controller, Inject } from '@nestjs/common';
import { IProductsController } from './interfaces/products.controller.interface';
import { ProductDto } from './dtos/product.dto';
import type { IProductsService } from './interfaces/products.service.interface';
import { Product } from './entities/product.entity';
import { IResponse } from '../../interfaces/response.interface';

@Controller('products')
export class ProductsController implements IProductsController {
  constructor(
    @Inject('IProductsService')
    private readonly productsService: IProductsService,
  ) {}

  async createProduct(
    productDto: ProductDto,
  ): Promise<IResponse<ProductDto | null>> {
    return await this.productsService.createProduct(productDto);
  }

  async findOneBySku(sku: string): Promise<IResponse<Product | null>> {
    return await this.productsService.findOneBySku(sku);
  }
}
