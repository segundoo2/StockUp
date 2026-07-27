/* eslint-disable @typescript-eslint/unbound-method */
import { ECategorySuccess } from '../../../enum/category-success.enum';
import { IResponse } from '../../../interfaces/response.interface';
import { CategoriesService } from '../categories.service';
import { CategoryDto } from '../dtos/category.dto';
import { Category } from '../entities/category.entity';
import { ICategoriesRepository } from '../interfaces/repository.interface';
import { ICategoriesService } from '../interfaces/service.interface';
import { ECategoryErrors } from '../../../enum/category-errors.enum';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateResult } from 'typeorm';

describe('CategoriesService', () => {
  let service: ICategoriesService;
  let repository: jest.Mocked<ICategoriesRepository>;

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
  let response: IResponse<Category | null> = {
    message: ECategorySuccess.CREATE,
    data: null,
  };

  beforeEach(() => {
    repository = {
      createCategory: jest.fn(),
      updateCategory: jest.fn(),
      findByCategoryName: jest.fn(),
    };

    service = new CategoriesService(repository);
  });

  describe('createCategory', () => {
    it(`should return the object { message: ${ECategorySuccess.CREATE}, data: null } when category is created success`, async () => {
      repository.createCategory.mockResolvedValue(category);
      expect(
        await service.createCategory({
          ...categoryDto,
          tenantId: category.tenantId,
        }),
      ).toEqual(response);
      expect(repository.createCategory).toHaveBeenCalledWith({
        ...categoryDto,
        tenantId: category.tenantId,
      });
    });

    it('should return ConflictException when category is existed', async () => {
      repository.findByCategoryName.mockResolvedValue(category);
      await expect(
        service.createCategory({ ...categoryDto, tenantId: category.tenantId }),
      ).rejects.toThrow(
        new ConflictException(ECategoryErrors.CONFLICT_CATEGORY),
      );
    });
  });

  describe('updateCategory', () => {
    response = { message: ECategorySuccess.UPDATE, data: null };
    const responseRepository: UpdateResult = {
      raw: [],
      generatedMaps: [],
      affected: 1,
    };

    it(`should return { message: ${ECategorySuccess.UPDATE}, data: null when the category is update success`, async () => {
      repository.updateCategory.mockResolvedValue(responseRepository);
      expect(
        await service.updateCategory(
          category.id,
          category.tenantId,
          categoryDto,
        ),
      ).toEqual(response);
      expect(repository.updateCategory).toHaveBeenCalledWith(
        category.id,
        category.tenantId,
        categoryDto,
      );
    });

    it('should return NotFoundException when property affected is equal 0', async () => {
      responseRepository.affected = 0;
      repository.updateCategory.mockResolvedValue(responseRepository);
      await expect(
        service.updateCategory(category.id, category.tenantId, categoryDto),
      ).rejects.toThrow(
        new NotFoundException(ECategoryErrors.CATEGORY_NOT_FOUND),
      );
    });
  });

  describe('findByCategoryName', () => {
    it(`should return the object { message: ${ECategorySuccess.FOUND_CATEGORY}, data: Category }`, async () => {
      response = {
        message: ECategorySuccess.FOUND_CATEGORY,
        data: category,
      };
      repository.findByCategoryName.mockResolvedValue(category);
      expect(
        await service.findByCategoryName(category.name, category.tenantId),
      ).toEqual(response);
      expect(repository.findByCategoryName).toHaveBeenCalledWith(
        category.name,
        category.tenantId,
      );
    });

    it('should return NotFoundException when Category not found', async () => {
      repository.findByCategoryName.mockResolvedValue(null);
      await expect(
        service.findByCategoryName(category.name, category.tenantId),
      ).rejects.toThrow(
        new NotFoundException(ECategoryErrors.CATEGORY_NOT_FOUND),
      );
    });
  });
});
