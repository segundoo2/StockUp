import { IResponse } from '../../../interfaces/response.interface';
import { CategoryDto } from '../dtos/category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { Category } from '../entities/category.entity';

export interface ICategoriesService {
  createCategory(
    categoryDto: CategoryDto & { tenantId: string },
  ): Promise<IResponse<null>>;

  updateCategory(
    id: string,
    tenantId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<IResponse<null>>;

  findByCategoryName(
    tenantId: string,
    nameCategory: string,
  ): Promise<IResponse<Category>>;

  findAllCategories(tenantId: string): Promise<IResponse<Category[]>>;

  deleteCategory(id: string, tenantId: string): Promise<IResponse<null>>;
}
