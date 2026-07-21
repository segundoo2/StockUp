import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IProductsRepository } from './interfaces/products.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductDto } from './dtos/product.dto';
import { EErrorsGlobal } from '../../enum/errors-global.enum';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductsRepository implements IProductsRepository {
  constructor(
    @InjectRepository(Product) private readonly repository: Repository<Product>,
  ) {}

  async createProduct(productDto: ProductDto & { tenantId }): Promise<Product> {
    try {
      const product = this.repository.create(productDto);
      return await this.repository.save(product);
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async updateProduct(
    updateProductDto: UpdateProductDto,
    id: string,
    tenantId: string,
  ): Promise<UpdateResult> {
    try {
      return await this.repository.update(
        {
          id,
          tenantId,
        },
        updateProductDto,
      );
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async updateCurrentStockById(
    productId: string,
    tenantId: string,
    newCurrentStock: number,
  ): Promise<UpdateResult> {
    try {
      return await this.repository.update(
        {
          id: productId,
          tenantId,
        },
        {
          currentStock: newCurrentStock,
        },
      );
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findOneCurrentStockById(
    id: string,
    tenantId: string,
  ): Promise<Pick<Product, 'currentStock' | 'uom'> | null> {
    try {
      return await this.repository.findOne({
        where: { id, tenantId },
        select: { currentStock: true, uom: true },
      });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findOneBySku(sku: string, tenantId: string): Promise<Product | null> {
    try {
      return await this.repository.findOne({
        where: { sku, tenantId },
      });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findAllProducts(tenantId: string): Promise<Product[] | []> {
    try {
      return await this.repository.find({ where: { tenantId } });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async deleteProduct(sku: string, tenantId: string): Promise<DeleteResult> {
    try {
      return await this.repository.delete({ sku, tenantId });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }
}
