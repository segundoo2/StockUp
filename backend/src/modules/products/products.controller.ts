import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
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
import { IResponse } from '../../common/interfaces/response.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateProductDto } from './dtos/update-product.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { EPermission } from '../../common/enum/permissions.enum';
import { RequiresPermission } from '../../common/decorators/permission.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { PaginationQueryDto } from '../../common/dtos/pagination-query.dto';
import { IPaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@ApiTags('Products')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador do Tenant',
  required: true,
})
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('products')
export class ProductsController implements IProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(
    @Inject('IProductsService')
    private readonly productsService: IProductsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequiresPermission(EPermission.PRODUCTS_CREATE)
  @ApiOperation({ summary: 'Cadastra um novo produto (Cadastro Rápido)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Produto criado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de requisição inválidos.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Produto com este SKU já existe no tenant.',
  })
  async createProduct(
    @Body() productDto: ProductDto,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    try {
      this.logger.log(
        `Tentativa de criação do produto SKU "${productDto.sku}" no tenant "${tenantId}".`,
      );

      const result = await this.productsService.createProduct({
        ...productDto,
        tenantId,
      });

      this.logger.log(
        `Produto SKU "${productDto.sku}" criado com sucesso no tenant "${tenantId}".`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao criar produto SKU "${productDto.sku}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.PRODUCTS_UPDATE)
  @ApiOperation({
    summary: 'Atualiza um produto ou vincula dados adicionais (Ex: Categoria)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do produto a ser atualizado',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produto atualizado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produto não encontrado.',
  })
  async updateProduct(
    @Body() updateProductDto: UpdateProductDto,
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    try {
      this.logger.log(
        `Atualizando produto ID "${id}" no tenant "${tenantId}".`,
      );

      const result = await this.productsService.updateProduct(
        updateProductDto,
        id,
        tenantId,
      );

      this.logger.log(
        `Produto ID "${id}" atualizado com sucesso no tenant "${tenantId}".`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar produto ID "${id}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get(':sku')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.PRODUCTS_READ)
  @ApiOperation({ summary: 'Busca um produto pelo SKU' })
  @ApiParam({
    name: 'sku',
    description: 'Código SKU do produto',
    type: String,
    example: 'PROD-ALFA-001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produto localizado.',
    type: Product,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produto não encontrado.',
  })
  async findOneBySku(
    @Param('sku') sku: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<Product>> {
    try {
      this.logger.log(
        `Buscando produto pelo SKU "${sku}" no tenant "${tenantId}".`,
      );
      return await this.productsService.findOneBySku(sku, tenantId);
    } catch (error) {
      this.logger.error(
        `Erro ao buscar produto SKU "${sku}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.PRODUCTS_READ)
  @ApiOperation({ summary: 'Lista os produtos do tenant com paginação' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de produtos retornada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Nenhum produto encontrado para este tenant.',
  })
  async findAllProducts(
    @TenantId() tenantId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<IPaginatedResponse<Product>> {
    try {
      this.logger.log(
        `Buscando listagem de produtos do tenant "${tenantId}" - Página: ${paginationQuery.page ?? 1}, Limite: ${paginationQuery.limit ?? 10}.`,
      );
      return await this.productsService.findAllProducts(
        tenantId,
        paginationQuery,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao buscar listagem de produtos do tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Delete(':sku')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.PRODUCTS_DELETE)
  @ApiOperation({ summary: 'Remove um produto pelo SKU' })
  @ApiParam({
    name: 'sku',
    description: 'Código SKU do produto a ser removido',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produto removido com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produto não encontrado.',
  })
  async deleteProduct(
    @Param('sku') sku: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    try {
      this.logger.warn(
        `Solicitação de remoção do produto SKU "${sku}" no tenant "${tenantId}".`,
      );

      const result = await this.productsService.deleteProduct(sku, tenantId);

      this.logger.log(
        `Produto SKU "${sku}" removido com sucesso do tenant "${tenantId}".`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao remover produto SKU "${sku}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
