import { Controller, Inject } from '@nestjs/common';
import { ICategoriesController } from './interfaces/controller.interface';
import { IResponse } from '../../interfaces/response.interface';
import { CategoryDto } from './dtos/category.dto';
import type { ICategoriesService } from './interfaces/service.interface';
import { Category } from './entities/category.entity';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Controller('categories')
export class CategoriesController implements ICategoriesController {
  constructor(
    @Inject('ICategoriesService')
    private readonly service: ICategoriesService,
  ) {}

  async createCategory(
    tenantId: string,
    categoryDto: CategoryDto,
  ): Promise<IResponse<null>> {
    return await this.service.createCategory({ tenantId, ...categoryDto });
  }

  async updateCategory(
    id: string,
    tenantId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<IResponse<null>> {
    return await this.service.updateCategory(id, tenantId, updateCategoryDto);
  }

  async findByCategoryName(
    tenantId: string,
    nameCategory: string,
  ): Promise<IResponse<Category>> {
    return await this.service.findByCategoryName(tenantId, nameCategory);
  }

  async findAllCategories(tenantId: string): Promise<IResponse<Category[]>> {
    return await this.service.findAllCategories(tenantId);
  }

  async deleteCategory(id: string, tenantId: string): Promise<IResponse<null>> {
    return await this.service.deleteCategory(id, tenantId);
  }
}
