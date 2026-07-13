import { Injectable } from '@nestjs/common';
import { IProductsRepository } from './interfaces/products.repository.interface';

@Injectable()
export class ProductsRepository implements IProductsRepository {}
