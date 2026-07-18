import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IProductsRepository } from './interfaces/products.repository.interface';
import { IProductsService } from './interfaces/products.service.interface';
import { ProductDto } from './dtos/product.dto';
import { EProductsSuccess } from './enums/products-success.enum';
import { Product } from './entities/product.entity';
import { IResponse } from '../../interfaces/response.interface';
import { EProductsErrors } from './enums/products-errors.enum';

@Injectable()
export class ProductsService implements IProductsService {
  constructor(
    @Inject('IProductsRepository')
    private readonly productsRepository: IProductsRepository,
  ) {}

  async createProduct(productDto: ProductDto): Promise<IResponse<Product>> {
    const existedProduct = await this.productsRepository.findOneBySku(
      productDto.sku,
      productDto.tenantId,
    );

    if (existedProduct) {
      throw new ConflictException(EProductsErrors.PRODUCT_EXIST);
    }

    return {
      message: EProductsSuccess.CREATE,
      data: await this.productsRepository.createProduct(productDto),
    };
  }

  async findOneBySku(
    sku: string,
    tenantId: string,
  ): Promise<IResponse<Product>> {
    const product = await this.productsRepository.findOneBySku(sku, tenantId);

    if (!product) {
      throw new NotFoundException(EProductsErrors.PRODUCT_NOT_FOUND);
    }
    return {
      message: EProductsSuccess.FIND_ONE,
      data: product,
    };
  }
}
