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
    tenantId: string,
  ): Promise<IResponse<null>> {
    productDto.tenantId = tenantId;
    return await this.productsService.createProduct(productDto);
  }

  async findOneBySku(
    sku: string,
    tenantId: string,
  ): Promise<IResponse<Product>> {
    return await this.productsService.findOneBySku(sku, tenantId);
  }

  async findAllProducts(tenantId: string): Promise<IResponse<Product[]>> {
    return await this.productsService.findAllProducts(tenantId);
  }

  async deleteProduct(sku: string, tenantId: string): Promise<IResponse<null>> {
    return await this.productsService.deleteProduct(sku, tenantId);
  }
}
