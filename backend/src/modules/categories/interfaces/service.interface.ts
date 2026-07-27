import { IResponse } from '../../../interfaces/response.interface';
import { CategoryDto } from '../dtos/category.dto';
import { Category } from '../entities/category.entity';

export interface ICategoriesService {
  createCategory(
    CategoryDto: CategoryDto & { tenantId: string },
  ): Promise<IResponse<null>>;
  findByCategoryName(
    nameCategory: string,
    tenantId: string,
  ): Promise<IResponse<Category>>;
}
