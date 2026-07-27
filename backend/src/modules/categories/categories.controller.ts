import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
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
import { ICategoriesController } from './interfaces/controller.interface';
import { IResponse } from '../../interfaces/response.interface';
import { CategoryDto } from './dtos/category.dto';
import type { ICategoriesService } from './interfaces/service.interface';
import { Category } from './entities/category.entity';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { RequiresAdmin } from '../../decorators/admin.decorator';
import { AdminGuard } from '../../guards/admin.guard';
import { TenantId } from '../../decorators/tenant-id.decorator';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController implements ICategoriesController {
  constructor(
    @Inject('ICategoriesService')
    private readonly service: ICategoriesService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequiresAdmin()
  @ApiOperation({ summary: 'Cria uma nova categoria' })
  @ApiResponse({
    status: 201,
    description: 'Categoria criada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer privilégios de administrador).',
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe uma categoria com esse nome para o tenant.',
  })
  async createCategory(
    @TenantId() tenantId: string,
    @Body() categoryDto: CategoryDto,
  ): Promise<IResponse<null>> {
    return await this.service.createCategory({ tenantId, ...categoryDto });
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequiresAdmin()
  @ApiOperation({ summary: 'Atualiza uma categoria existente pelo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da categoria (UUID)',
    type: String,
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria atualizada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer privilégios de administrador).',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada.',
  })
  async updateCategory(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<IResponse<null>> {
    return await this.service.updateCategory(id, tenantId, updateCategoryDto);
  }

  @Get(':name')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequiresAdmin()
  @ApiOperation({ summary: 'Busca uma categoria pelo nome' })
  @ApiParam({
    name: 'name',
    description: 'Nome da categoria a ser buscada',
    type: String,
    example: 'Eletrônicos',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria encontrada.',
    type: Category,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer privilégios de administrador).',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada.',
  })
  async findByCategoryName(
    @TenantId() tenantId: string,
    @Param('name') nameCategory: string,
  ): Promise<IResponse<Category>> {
    return await this.service.findByCategoryName(tenantId, nameCategory);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequiresAdmin()
  @ApiOperation({ summary: 'Lista todas as categorias do tenant' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias retornada com sucesso.',
    type: [Category],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer privilégios de administrador).',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhuma categoria encontrada para este tenant.',
  })
  async findAllCategories(
    @TenantId() tenantId: string,
  ): Promise<IResponse<Category[]>> {
    return await this.service.findAllCategories(tenantId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequiresAdmin()
  @ApiOperation({ summary: 'Remove uma categoria pelo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da categoria a ser removida (UUID)',
    type: String,
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria removida com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer privilégios de administrador).',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada.',
  })
  async deleteCategory(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.service.deleteCategory(id, tenantId);
  }
}
