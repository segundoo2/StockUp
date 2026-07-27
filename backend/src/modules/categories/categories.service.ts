import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICategoriesService } from './interfaces/service.interface';
import { IResponse } from '../../interfaces/response.interface';
import { CategoryDto } from './dtos/category.dto';
import type { ICategoriesRepository } from './interfaces/repository.interface';
import { ECategorySuccess } from '../../enum/category-success.enum';
import { Category } from './entities/category.entity';
import { ECategoryErrors } from '../../enum/category-errors.enum';

@Injectable()
export class CategoriesService implements ICategoriesService {
  constructor(
    @Inject('ICategoriesRespository')
    private readonly repository: ICategoriesRepository,
  ) {}

  async createCategory(
    categoryDto: CategoryDto & { tenantId: string },
  ): Promise<IResponse<null>> {
    const categoryExisted = await this.repository.findByCategoryName(
      categoryDto.name,
      categoryDto.tenantId,
    );

    if (categoryExisted) {
      throw new ConflictException(ECategoryErrors.CONFLICT_CATEGORY);
    }

    await this.repository.createCategory(categoryDto);
    return { message: ECategorySuccess.CREATE, data: null };
  }

  async findByCategoryName(
    nameCategory: string,
    tenantId: string,
  ): Promise<IResponse<Category>> {
    const category = await this.repository.findByCategoryName(
      nameCategory,
      tenantId,
    );

    if (!category) {
      throw new NotFoundException(ECategoryErrors.CATEGORY_NOT_FOUND);
    }

    return {
      message: ECategorySuccess.FOUND_CATEGORY,
      data: category,
    };
  }
}
