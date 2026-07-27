import { CategoryDto } from '../dtos/category.dto';
import { Category } from '../entities/category.entity';

export interface ICategoriesRepository {
  createCategory(
    CategoryDto: CategoryDto & { tenantId: string },
  ): Promise<Category>;
  findByCategoryName(
    nameCategory: string,
    tenantId: string,
  ): Promise<Category | null>;
}
