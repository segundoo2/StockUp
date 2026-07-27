/* eslint-disable @typescript-eslint/unbound-method */
import { Repository, UpdateResult } from 'typeorm';
import { Category } from '../entities/category.entity';
import { ICategoriesRepository } from '../interfaces/repository.interface';
import { CategoriesRepository } from '../categories.repository';
import { CategoryDto } from '../dtos/category.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { EErrorsGlobal } from '../../../enum/errors-global.enum';

describe('CategoriesRepository', () => {
  let categoriesRepository: ICategoriesRepository;
  let ormRepository: jest.Mocked<Repository<Category>>;

  const categoryDto: CategoryDto = {
    name: 'capinhas',
    isActive: true,
    description: 'capinhas de celulares de diversos modelos',
  };
  const category: Category = {
    id: 'uuid',
    tenantId: 'tenant-uuid',
    name: 'capinhas',
    description: 'capinhas variadas',
    isActive: true,
    products: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    ormRepository = {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Category>>;

    categoriesRepository = new CategoriesRepository(ormRepository);
  });

  const shouldHandleDatabaseErrors = (
    operation: () => Promise<unknown>,
    mockMethod: () => jest.Mock | undefined,
  ) => {
    it('should return InternalServerException when TypeORM throws an error', async () => {
      mockMethod()?.mockRejectedValue(
        new Error('[TypeOrmModule] Unable to connect to the database'),
      );

      await expect(operation()).rejects.toThrow(
        new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR),
      );
    });
  };

  describe('createCategory', () => {
    it('should return the category entity when it is save success', async () => {
      ormRepository.create.mockReturnValue(category);
      ormRepository.save.mockResolvedValue(category);
      expect(
        await categoriesRepository.createCategory({
          ...categoryDto,
          tenantId: category.tenantId,
        }),
      ).toEqual(category);
      expect(ormRepository.create).toHaveBeenCalledWith({
        ...categoryDto,
        tenantId: category.tenantId,
      });
      expect(ormRepository.save).toHaveBeenCalledWith(category);
    });

    shouldHandleDatabaseErrors(
      () =>
        categoriesRepository.createCategory({
          ...categoryDto,
          tenantId: category.tenantId,
        }),
      () => ormRepository.save as unknown as jest.Mock,
    );
  });

  describe('updateCategory', () => {
    const responseRepository: UpdateResult = {
      raw: [],
      generatedMaps: [],
      affected: 1,
    };

    it('should return the object { raw: [], generatedMaps: [], affected: 1 } when the category is updated success', async () => {
      ormRepository.update.mockResolvedValue(responseRepository);
      expect(
        await categoriesRepository.updateCategory(
          category.id,
          category.tenantId,
          categoryDto,
        ),
      ).toEqual(responseRepository);
      expect(ormRepository.update).toHaveBeenCalledWith(
        { id: category.id, tenantId: category.tenantId },
        categoryDto,
      );
    });

    shouldHandleDatabaseErrors(
      () =>
        categoriesRepository.updateCategory(
          category.id,
          category.tenantId,
          categoryDto,
        ),
      () => ormRepository.update as unknown as jest.Mock,
    );
  });

  describe('findByCategoryName', () => {
    it('should return Category when it is found success', async () => {
      ormRepository.findOne.mockResolvedValue(category);
      expect(
        await categoriesRepository.findByCategoryName(
          category.name,
          category.tenantId,
        ),
      ).toEqual(category);
      expect(ormRepository.findOne).toHaveBeenCalledWith({
        where: { category: category.name, tenantId: category.tenantId },
      });
    });

    shouldHandleDatabaseErrors(
      () =>
        categoriesRepository.findByCategoryName(
          category.name,
          category.tenantId,
        ),
      () => ormRepository.findOne as unknown as jest.Mock,
    );
  });
});
