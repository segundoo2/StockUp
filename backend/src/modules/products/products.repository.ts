import { Injectable } from '@nestjs/common';
import { IProductsRepository } from './interfaces/products.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductDto } from './dtos/product.dto';

@Injectable()
export class ProductsRepository implements IProductsRepository {
  constructor(
    @InjectRepository(Product) private readonly repository: Repository<Product>,
  ) {}

  createProduct(productDto: ProductDto): Promise<Product> {
    
  }
}
