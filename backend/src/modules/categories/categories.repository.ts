import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ICategoriesRepository } from './interfaces/repository.interface';
import { CategoryDto } from './dtos/category.dto';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EErrorsGlobal } from '../../enum/errors-global.enum';

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
}
