import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/user.entity';
import { ProductsRepository } from './products.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [
    { provide: 'IProductsService', useClass: ProductsService },
    { provide: 'IProductsRepository', useClass: ProductsRepository },
  ],
})
export class ProductsModule {}
