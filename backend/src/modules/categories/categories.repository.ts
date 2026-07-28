import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ICategoriesRepository } from './interfaces/categories.repository.interface';
import { CategoryDto } from './dtos/category.dto';
import { Category } from './entities/category.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EErrorsGlobal } from '../../enum/errors-global.enum';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Injectable()
export class CategoriesRepository implements ICategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  async createCategory(
    categoryDto: CategoryDto & { tenantId: string },
  ): Promise<Category> {
    try {
      const category: Category = this.repository.create(categoryDto);
      return await this.repository.save(category);
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async updateCategory(
    id: string,
    tenantId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<UpdateResult> {
    try {
      return await this.repository.update({ id, tenantId }, updateCategoryDto);
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findByCategoryName(
    nameCategory: string,
    tenantId: string,
  ): Promise<Category | null> {
    try {
      return await this.repository.findOne({
        where: { name: nameCategory, tenantId },
      });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findAllCategories(tenantId: string): Promise<Category[]> {
    try {
      return await this.repository.find({ where: { tenantId } });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async deleteCategory(id: string, tenantId: string): Promise<DeleteResult> {
    try {
      return await this.repository.delete({ id, tenantId });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }
}
