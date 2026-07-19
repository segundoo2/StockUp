import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IProductsController } from './interfaces/products.controller.interface';
import { ProductDto } from './dtos/product.dto';
import type { IProductsService } from './interfaces/products.service.interface';
import { Product } from './entities/product.entity';
import { IResponse } from '../../interfaces/response.interface';
import { TenantId } from '../../decorators/tenant-id.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../guards/admin.guard';
import { RequiresAdmin } from '../../decorators/admin.decorator';

@Controller('products')
export class ProductsController implements IProductsController {
  constructor(
    @Inject('IProductsService')
    private readonly productsService: IProductsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequiresAdmin()
  async createProduct(
    @Body()
    productDto: ProductDto,
    @TenantId()
    tenantId: string,
  ): Promise<IResponse<null>> {
    productDto.tenantId = tenantId;
    return await this.productsService.createProduct(productDto);
  }

  @Get(':sku')
  @UseGuards(AuthGuard('jwt'))
  async findOneBySku(
    @Param('sku')
    sku: string,
    @TenantId()
    tenantId: string,
  ): Promise<IResponse<Product>> {
    return await this.productsService.findOneBySku(sku, tenantId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAllProducts(
    @TenantId() tenantId: string,
  ): Promise<IResponse<Product[]>> {
    return await this.productsService.findAllProducts(tenantId);
  }

  @Delete(':sku')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequiresAdmin()
  async deleteProduct(
    @Param('sku') sku: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.productsService.deleteProduct(sku, tenantId);
  }
}
