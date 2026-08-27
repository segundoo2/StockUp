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
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ICategoriesController } from './interfaces/categories.controller.interface';
import { IResponse } from '../../interfaces/response.interface';
import { CategoryDto } from './dtos/category.dto';
import type { ICategoriesService } from './interfaces/categories.service.interface';
import { Category } from './entities/category.entity';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantId } from '../../decorators/tenant-id.decorator';
import { PermissionGuard } from '../../guards/permission.guard';
import { RequiresPermission } from '../../decorators/permission.decorator';
import { EPermission } from '../../enum/permissions.enum';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('categories')
export class CategoriesController implements ICategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(
    @Inject('ICategoriesService')
    private readonly service: ICategoriesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequiresPermission(EPermission.CATEGORIES_CREATE)
  @ApiOperation({ summary: 'Cria uma nova categoria' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Categoria criada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado (requer privilégios de administrador).',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Já existe uma categoria com esse nome para o tenant.',
  })
  async createCategory(
    @TenantId() tenantId: string,
    @Body() categoryDto: CategoryDto,
  ): Promise<IResponse<null>> {
    try {
      this.logger.log(
        `Tentativa de criação da categoria "${categoryDto.name}" no tenant "${tenantId}".`,
      );

      const result = await this.service.createCategory({
        tenantId,
        ...categoryDto,
      });

      this.logger.log(
        `Categoria "${categoryDto.name}" criada com sucesso no tenant "${tenantId}".`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao criar categoria "${categoryDto.name}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get(':name')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.CATEGORIES_READ)
  @ApiOperation({ summary: 'Busca uma categoria pelo nome' })
  @ApiParam({
    name: 'name',
    description: 'Nome da categoria a ser buscada',
    type: String,
    example: 'Eletrônicos',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoria encontrada.',
    type: Category,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado (requer privilégios de administrador).',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Categoria não encontrada.',
  })
  async findByCategoryName(
    @TenantId() tenantId: string,
    @Param('name') nameCategory: string,
  ): Promise<IResponse<Category>> {
    try {
      this.logger.log(
        `Buscando categoria pelo nome "${nameCategory}" no tenant "${tenantId}".`,
      );
      return await this.service.findByCategoryName(tenantId, nameCategory);
    } catch (error) {
      this.logger.error(
        `Erro ao buscar categoria "${nameCategory}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.CATEGORIES_READ)
  @ApiOperation({ summary: 'Lista todas as categorias do tenant' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de categorias retornada com sucesso.',
    type: [Category],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado (requer privilégios de administrador).',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Nenhuma categoria encontrada para este tenant.',
  })
  async findAllCategories(
    @TenantId() tenantId: string,
  ): Promise<IResponse<Category[]>> {
    try {
      this.logger.log(
        `Buscando listagem de categorias para o tenant "${tenantId}".`,
      );
      return await this.service.findAllCategories(tenantId);
    } catch (error) {
      this.logger.error(
        `Erro ao buscar lista de categorias do tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.CATEGORIES_UPDATE)
  @ApiOperation({ summary: 'Atualiza uma categoria existente pelo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da categoria (UUID)',
    type: String,
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoria atualizada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado (requer privilégios de administrador).',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Categoria não encontrada.',
  })
  async updateCategory(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<IResponse<null>> {
    try {
      this.logger.log(
        `Atualizando categoria ID "${id}" no tenant "${tenantId}".`,
      );

      const result = await this.service.updateCategory(
        id,
        tenantId,
        updateCategoryDto,
      );

      this.logger.log(
        `Categoria ID "${id}" atualizada com sucesso no tenant "${tenantId}".`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar categoria ID "${id}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.CATEGORIES_DELETE)
  @ApiOperation({ summary: 'Remove uma categoria pelo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da categoria a ser removida (UUID)',
    type: String,
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoria removida com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado (requer privilégios de administrador).',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Categoria não encontrada.',
  })
  async deleteCategory(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    try {
      this.logger.warn(
        `Solicitação de remoção da categoria ID "${id}" no tenant "${tenantId}".`,
      );

      const result = await this.service.deleteCategory(id, tenantId);

      this.logger.log(
        `Categoria ID "${id}" removida com sucesso do tenant "${tenantId}".`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao remover categoria ID "${id}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
