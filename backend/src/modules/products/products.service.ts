import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IProductsRepository } from './interfaces/products.repository.interface';
import { IProductsService } from './interfaces/products.service.interface';
import { ProductDto } from './dtos/product.dto';
import { IProductsResponse } from './interfaces/products-response.interface';
import { EProductsSuccess } from './enums/products-success.enum';
import { Product } from './entities/product.entity';
import { EProductsError } from './enums/products-error.enum';

@Injectable()
export class ProductsService implements IProductsService {
  constructor(
    @Inject('IProductsRepository')
    private readonly productsRepository: IProductsRepository,
  ) {}

  async createProduct(
    productDto: ProductDto,
  ): Promise<IProductsResponse<Product | null>> {
    const product: Product =
      await this.productsRepository.createProduct(productDto);
    const existedProd = await this.productsRepository.findOneBySku(
      productDto.sku,
    );
    if (existedProd) {
      throw new ConflictException(EProductsError.CONFLICT_PRODUCT);
    }
    return {
      message: EProductsSuccess.CREATE,
      data: product,
    };
  }

  async findOneBySku(sku: string): Promise<IProductsResponse<Product | null>> {
    const product = await this.productsRepository.findOneBySku(sku);
    if (!product) {
      throw new NotFoundException(EProductsError.PRODUCT_NOT_FOUND);
    }
    return { message: EProductsSuccess.FIND_ONE, data: product };
  }
}
