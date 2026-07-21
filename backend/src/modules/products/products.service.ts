import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IProductsRepository } from './interfaces/products.repository.interface';
import { IProductsService } from './interfaces/products.service.interface';
import { ProductDto } from './dtos/product.dto';
import { EProductsSuccess } from '../../enum/products-success.enum';
import { Product } from './entities/product.entity';
import { IResponse } from '../../interfaces/response.interface';
import { EProductsErrors } from '../../enum/products-errors.enum';
import { DeleteResult } from 'typeorm';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductsService implements IProductsService {
  constructor(
    @Inject('IProductsRepository')
    private readonly productsRepository: IProductsRepository,
  ) {}

  async createProduct(
    productDto: ProductDto & { tenantId: string },
  ): Promise<IResponse<null>> {
    const existedProduct = await this.productsRepository.findOneBySku(
      productDto.sku,
      productDto.tenantId,
    );

    if (existedProduct) {
      throw new ConflictException(EProductsErrors.PRODUCT_EXIST);
    }

    await this.productsRepository.createProduct(productDto);
    return {
      message: EProductsSuccess.CREATE,
      data: null,
    };
  }

  async updateProduct(
    updateProductDto: UpdateProductDto,
    id: string,
    tenantId: string,
  ): Promise<IResponse<null>> {
    const productUpdated = await this.productsRepository.updateProduct(
      updateProductDto,
      id,
      tenantId,
    );

    if (productUpdated.affected === 0) {
      throw new NotFoundException(EProductsErrors.PRODUCT_NOT_FOUND);
    }

    return {
      message: EProductsSuccess.UPDATE,
      data: null,
    };
  }

  async applyStockDelta(
    productId: string,
    tenantId: string,
    delta: number,
  ): Promise<IResponse<{ newCurrentStock: number }>> {
    const findCurrentStock =
      await this.productsRepository.findOneCurrentStockById(
        productId,
        tenantId,
      );
    if (!findCurrentStock) {
      throw new NotFoundException(EProductsErrors.PRODUCT_NOT_FOUND);
    }
    const newCurrentStock: number = findCurrentStock.currentStock + delta;
    await this.productsRepository.updateCurrentStockById(
      productId,
      tenantId,
      newCurrentStock,
    );
    return {
      message:
        delta > 0
          ? EProductsSuccess.INPUT_MOVIMENT
          : EProductsSuccess.OUTPUT_MOVIMENT,
      data: { newCurrentStock: newCurrentStock },
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

  async findAllProducts(tenantId: string): Promise<IResponse<Product[]>> {
    const productList = await this.productsRepository.findAllProducts(tenantId);
    if (productList?.length === 0) {
      throw new NotFoundException(EProductsErrors.PRODUCT_NOT_FOUND);
    }
    return {
      message: EProductsSuccess.FIND_ALL,
      data: productList as Product[],
    };
  }

  async deleteProduct(sku: string, tenantId: string): Promise<IResponse<null>> {
    const deletedProduct: DeleteResult =
      await this.productsRepository.deleteProduct(sku, tenantId);

    if (deletedProduct.affected === 0) {
      throw new NotFoundException(EProductsErrors.PRODUCT_NOT_FOUND);
    }

    return { message: EProductsSuccess.DELETE, data: null };
  }
}
