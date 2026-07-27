/* eslint-disable @typescript-eslint/unbound-method */
import { ECategorySuccess } from '../../../enum/category-success.enum';
import { IResponse } from '../../../interfaces/response.interface';
import { CategoriesController } from '../categories.controller';
import { CategoryDto } from '../dtos/category.dto';
import { Category } from '../entities/category.entity';
import { ICategoriesController } from '../interfaces/controller.interface';
import { ICategoriesService } from '../interfaces/service.interface';

describe('CategoriesController', () => {
  let controller: ICategoriesController;
  let service: jest.Mocked<ICategoriesService>;

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
    service = {
      createCategory: jest.fn(),
      updateCategory: jest.fn(),
      findByCategoryName: jest.fn(),
    };

    controller = new CategoriesController(service);
  });

  describe('createCategory', () => {
    it(`should return the object { message: ${ECategorySuccess.CREATE}, data: null } when category is created success`, async () => {
      service.createCategory.mockResolvedValue(response as IResponse<null>);
      expect(
        await controller.createCategory(categoryDto, category.tenantId),
      ).toEqual(response);
      expect(service.createCategory).toHaveBeenCalledWith({
        ...categoryDto,
        tenantId: category.tenantId,
      });
    });
  });

  describe('updateCategory', () => {
    it(`should return { message: ${ECategorySuccess.UPDATE}, data: null when the category is update success`, async () => {
      response = { message: ECategorySuccess.UPDATE, data: null };
      service.updateCategory.mockResolvedValue(response as IResponse<null>);
      expect(
        await controller.updateCategory(categoryDto, category.tenantId),
      ).toEqual(response);
    });
  });

  describe('findByCategoryName', () => {
    it(`should return the object { message: ${ECategorySuccess.FOUND_CATEGORY}, data: Category }`, async () => {
      response = {
        message: ECategorySuccess.FOUND_CATEGORY,
        data: category,
      };
      service.findByCategoryName.mockResolvedValue(
        response as IResponse<Category>,
      );
      expect(
        await controller.findByCategoryName(category.name, category.tenantId),
      ).toEqual(response);
    });
  });
});
