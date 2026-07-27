import { DeleteResult, UpdateResult } from 'typeorm';
import { CategoryDto } from '../dtos/category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { Category } from '../entities/category.entity';

export interface ICategoriesRepository {
  createCategory(
    CategoryDto: CategoryDto & { tenantId: string },
  ): Promise<Category>;

  updateCategory(
    id: string,
    tenantId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<UpdateResult>;

  findByCategoryName(
    tenantId: string,
    nameCategory: string,
  ): Promise<Category | null>;

  findAllCategories(tenantId: string): Promise<Category[] | []>;

  deleteCategory(id: string, tenantId: string): Promise<DeleteResult>;
}
