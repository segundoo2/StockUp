import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IProductsController } from './interfaces/products.controller.interface';
import { ProductDto } from './dtos/product.dto';
import type { IProductsService } from './interfaces/products.service.interface';
import { Product } from './entities/product.entity';
import { IResponse } from '../../interfaces/response.interface';
import { TenantId } from '../../decorators/tenant-id.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../guards/admin.guard';
import { RequiresAdmin } from '../../decorators/admin.decorator';
import { UpdateProductDto } from './dtos/update-product.dto';

@ApiTags('Products')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador do Tenant',
  required: true,
})
@Controller('products')
export class ProductsController implements IProductsController {
  constructor(
    @Inject('IProductsService')
    private readonly productsService: IProductsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequiresAdmin()
  @ApiOperation({ summary: 'Cadastra um novo produto (Cadastro Rápido)' })
  @ApiResponse({
    status: 201,
    description: 'Produto criado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de requisição inválidos.',
  })
  @ApiResponse({
    status: 409,
    description: 'Produto com este SKU já existe no tenant.',
  })
  async createProduct(
    @Body() productDto: ProductDto,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.productsService.createProduct({
      ...productDto,
      tenantId,
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequiresAdmin()
  @ApiOperation({
    summary: 'Atualiza um produto ou vincula dados adicionais (Ex: Categoria)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do produto a ser atualizado',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Produto atualizado com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado.',
  })
  async updateProduct(
    @Body() updateProductDto: UpdateProductDto,
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.productsService.updateProduct(
      updateProductDto,
      id,
      tenantId,
    );
  }

  @Get(':sku')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Busca um produto pelo SKU' })
  @ApiParam({
    name: 'sku',
    description: 'Código SKU do produto',
    type: String,
    example: 'PROD-ALFA-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto localizado.',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado.',
  })
  async findOneBySku(
    @Param('sku') sku: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<Product>> {
    return await this.productsService.findOneBySku(sku, tenantId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lista todos os produtos do tenant' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos retornada com sucesso.',
    type: [Product],
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum produto encontrado para este tenant.',
  })
  async findAllProducts(
    @TenantId() tenantId: string,
  ): Promise<IResponse<Product[]>> {
    return await this.productsService.findAllProducts(tenantId);
  }

  @Delete(':sku')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequiresAdmin()
  @ApiOperation({ summary: 'Remove um produto pelo SKU' })
  @ApiParam({
    name: 'sku',
    description: 'Código SKU do produto a ser removido',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Produto removido com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado.',
  })
  async deleteProduct(
    @Param('sku') sku: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.productsService.deleteProduct(sku, tenantId);
  }
}
