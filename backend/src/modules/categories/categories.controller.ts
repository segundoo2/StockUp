import { Controller, Inject } from '@nestjs/common';
import { ICategoriesController } from './interfaces/controller.interface';
import { IResponse } from '../../interfaces/response.interface';
import { CategoryDto } from './dtos/category.dto';
import type { ICategoriesService } from './interfaces/service.interface';
import { Category } from './entities/category.entity';

@Controller('categories')
export class CategoriesController implements ICategoriesController {
  constructor(
    @Inject('ICategoriesService')
    private readonly service: ICategoriesService,
  ) {}

  async createCategory(
    categoryDto: CategoryDto,
    tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.service.createCategory({ ...categoryDto, tenantId });
  }

  async findByCategoryName(
    nameCategory: string,
    tenantId: string,
  ): Promise<IResponse<Category>> {
    return await this.service.findByCategoryName(nameCategory, tenantId);
  }
}
