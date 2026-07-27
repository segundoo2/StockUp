import { Category } from '../entities/category.entity';

export abstract class CategoryDto implements Pick<
  Category,
  'name' | 'description' | 'isActive'
> {
  name!: string;
  description?: string | null | undefined;
  isActive!: boolean;
}
