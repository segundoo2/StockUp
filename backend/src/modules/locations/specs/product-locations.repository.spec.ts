/* eslint-disable @typescript-eslint/unbound-method */
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { EErrorsGlobal } from '../../../common/enum/errors-global.enum';
import { ProductLocation } from '../entities/product-location.entity';
import { ProductLocationsRepository } from '../product-location.repository';

type MockRepository<T extends object = object> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

type MockQueryBuilder<T extends object = object> = {
  [P in keyof SelectQueryBuilder<T>]?: jest.Mock;
};

describe('ProductLocationsRepository', () => {
  let repository: ProductLocationsRepository;
  let ormMock: MockRepository<ProductLocation>;
  let queryBuilderMock: MockQueryBuilder<ProductLocation>;

  const tenantId = 'tenant-uuid-123';
  const productId = 'prod-uuid-123';
  const locationId = 'loc-uuid-123';

  const mockProductLocation: ProductLocation = {
    id: 'pl-uuid-123',
    tenantId,
    productId,
    locationId,
    quantity: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    queryBuilderMock = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    };

    ormMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      increment: jest.fn(),
      decrement: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductLocationsRepository,
        {
          provide: getRepositoryToken(ProductLocation),
          useValue: ormMock,
        },
      ],
    }).compile();

    repository = module.get<ProductLocationsRepository>(
      ProductLocationsRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByProductAndLocation', () => {
    it('should return a product location record when found', async () => {
      ormMock.findOne?.mockResolvedValue(mockProductLocation);

      const result = await repository.findByProductAndLocation(
        productId,
        locationId,
        tenantId,
      );

      expect(result).toEqual(mockProductLocation);
      expect(ormMock.findOne).toHaveBeenCalledWith({
        where: { productId, locationId, tenantId },
      });
    });

    it('should use transactional EntityManager when provided', async () => {
      const txRepository = {
        findOne: jest.fn().mockResolvedValue(mockProductLocation),
      };
      const entityManager = {
        getRepository: jest.fn().mockReturnValue(txRepository),
      } as unknown as EntityManager;

      const result = await repository.findByProductAndLocation(
        productId,
        locationId,
        tenantId,
        entityManager,
      );

      expect(result).toEqual(mockProductLocation);
      expect(entityManager.getRepository).toHaveBeenCalledWith(ProductLocation);
      expect(txRepository.findOne).toHaveBeenCalledWith({
        where: { productId, locationId, tenantId },
      });
    });

    it('should throw InternalServerErrorException on database failure', async () => {
      ormMock.findOne?.mockRejectedValue(new Error('DB Error'));

      await expect(
        repository.findByProductAndLocation(productId, locationId, tenantId),
      ).rejects.toThrow(
        new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR),
      );
    });
  });

  describe('sumAllocatedStock', () => {
    it('should return total allocated stock as number', async () => {
      queryBuilderMock.getRawOne?.mockResolvedValue({ total: '25.5' });

      const total = await repository.sumAllocatedStock(productId, tenantId);

      expect(total).toBe(25.5);
      expect(ormMock.createQueryBuilder).toHaveBeenCalledWith('pl');
      expect(queryBuilderMock.select).toHaveBeenCalledWith(
        'SUM(pl.quantity)',
        'total',
      );
    });

    it('should return 0 when total is null', async () => {
      queryBuilderMock.getRawOne?.mockResolvedValue({ total: null });

      const total = await repository.sumAllocatedStock(productId, tenantId);

      expect(total).toBe(0);
    });

    it('should throw InternalServerErrorException on query failure', async () => {
      queryBuilderMock.getRawOne?.mockRejectedValue(new Error('DB Error'));

      await expect(
        repository.sumAllocatedStock(productId, tenantId),
      ).rejects.toThrow(
        new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR),
      );
    });
  });

  describe('incrementQuantity', () => {
    it('should create new record when allocation location does not exist', async () => {
      ormMock.findOne?.mockResolvedValue(null);
      ormMock.create?.mockReturnValue(mockProductLocation);
      ormMock.save?.mockResolvedValue(mockProductLocation);

      await repository.incrementQuantity(productId, locationId, tenantId, 5);

      expect(ormMock.create).toHaveBeenCalledWith({
        productId,
        locationId,
        tenantId,
        quantity: 5,
      });
      expect(ormMock.save).toHaveBeenCalledWith(mockProductLocation);
      expect(ormMock.increment).not.toHaveBeenCalled();
    });

    it('should execute atomic increment when record already exists', async () => {
      ormMock.findOne?.mockResolvedValue(mockProductLocation);
      ormMock.increment?.mockResolvedValue({ generatedMaps: [], raw: [] });

      await repository.incrementQuantity(productId, locationId, tenantId, 5);

      expect(ormMock.increment).toHaveBeenCalledWith(
        { productId, locationId, tenantId },
        'quantity',
        5,
      );
      expect(ormMock.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on unexpected failure', async () => {
      ormMock.findOne?.mockRejectedValue(new Error('DB Error'));

      await expect(
        repository.incrementQuantity(productId, locationId, tenantId, 5),
      ).rejects.toThrow(
        new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR),
      );
    });
  });

  describe('decrementQuantity', () => {
    it('should execute atomic decrement when stock is sufficient', async () => {
      ormMock.findOne?.mockResolvedValue(mockProductLocation);
      ormMock.decrement?.mockResolvedValue({ generatedMaps: [], raw: [] });

      await repository.decrementQuantity(productId, locationId, tenantId, 5);

      expect(ormMock.decrement).toHaveBeenCalledWith(
        { productId, locationId, tenantId },
        'quantity',
        5,
      );
    });

    it('should throw BadRequestException when location record is not found', async () => {
      ormMock.findOne?.mockResolvedValue(null);

      await expect(
        repository.decrementQuantity(productId, locationId, tenantId, 5),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when stock quantity is less than requested', async () => {
      ormMock.findOne?.mockResolvedValue({
        ...mockProductLocation,
        quantity: 2,
      });

      await expect(
        repository.decrementQuantity(productId, locationId, tenantId, 5),
      ).rejects.toThrow(BadRequestException);
    });

    it('should rethrow BadRequestException without converting to InternalServerErrorException', async () => {
      ormMock.findOne?.mockResolvedValue(null);

      await expect(
        repository.decrementQuantity(productId, locationId, tenantId, 5),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
