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
  const tenantId = 'tenant-uuid';
  let response: IResponse<Category | null> = {
    message: ECategorySuccess.CREATE,
    data: null,
  };

  beforeEach(() => {
    repository = {
      createCategory: jest.fn(),
      findByCategoryName: jest.fn(),
    };

    service = new CategoriesService(repository);
  });

  describe('createCategory', () => {
    it(`should return the object { message: ${ECategorySuccess.CREATE}, data: null } when category is created success`, async () => {
      repository.createCategory.mockResolvedValue(category);
      expect(
        await service.createCategory({ ...categoryDto, tenantId }),
      ).toEqual(response);
      expect(repository.createCategory).toHaveBeenCalledWith({
        ...categoryDto,
        tenantId,
      });
    });

    it('should return ConflictException when category is existed', async () => {
      repository.findByCategoryName.mockResolvedValue(category);
      await expect(
        service.createCategory({ ...categoryDto, tenantId }),
      ).rejects.toThrow(
        new ConflictException(ECategoryErrors.CONFLICT_CATEGORY),
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
    });

    it('should return NotFoundException when Category not found', async () => {
      repository.findByCategoryName.mockResolvedValue(null);
      await expect(
        service.findByCategoryName(category.name, tenantId),
      ).rejects.toThrow(
        new NotFoundException(ECategoryErrors.CATEGORY_NOT_FOUND),
      );
    });
  });
});
