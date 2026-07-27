import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  Length,
} from 'class-validator';
import { Category } from '../entities/category.entity';
import { ECategoryErrors } from '../../../enum/category-errors.enum';

export class CategoryDto implements Pick<
  Category,
  'name' | 'description' | 'isActive'
> {
  @IsString({ message: ECategoryErrors.NAME_STRING_REQUIRED })
  @IsNotEmpty({ message: ECategoryErrors.NAME_CATEGORY })
  @Length(2, 50, { message: ECategoryErrors.NAME_CATEGORY })
  name!: string;

  @IsString({ message: ECategoryErrors.DESCRIPTION_STRING_REQUIRED })
  @IsOptional()
  @MaxLength(100, { message: ECategoryErrors.DESCRIPTION_CATEGORY })
  description?: string | null;

  @IsBoolean({ message: ECategoryErrors.BOOLEAN_REQUIRED })
  isActive!: boolean;
}
