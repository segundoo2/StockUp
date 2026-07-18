import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IProductsRepository } from './interfaces/products.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductDto } from './dtos/product.dto';
import { EErrorsGlobal } from '../../enum/errors-global.enum';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsRepository implements IProductsRepository {
  constructor(
    @InjectRepository(Product) private readonly repository: Repository<Product>,
  ) {}

  async createProduct(productDto: ProductDto): Promise<Product> {
    try {
      const product = this.repository.create(productDto);
      return await this.repository.save(product);
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
}
