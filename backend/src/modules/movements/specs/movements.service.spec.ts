/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { EMovementsSuccess } from '../../../common/enum/movements-success.enum';
import { EProductsErrors } from '../../../common/enum/products-errors.enum';
import { IProductLocationsRepository } from '../../locations/interfaces/product-locations.repository.interface';
import { Product } from '../../products/entities/product.entity';
import { IProductsService } from '../../products/interfaces/products.service.interface';
import { AllocateLocationDto } from '../dtos/allocate-product-location.dto';
import { EMovementType, MovementDto } from '../dtos/movement.dto';
import { IMovementsRepository } from '../interfaces/movements.repository.interface';
import { IMovementsService } from '../interfaces/movements.service.interface';
import { MovementsService } from '../movements.service';

describe('MovementsService', () => {
  let service: IMovementsService;
  let mockMovementsRepository: jest.Mocked<IMovementsRepository>;
  let mockProductsService: jest.Mocked<IProductsService>;
  let mockProductLocationsRepository: jest.Mocked<IProductLocationsRepository>;
  let mockDataSource: Partial<DataSource>;

  const mockEntityManager = {} as EntityManager;
  const tenantId = 'tenant-uuid-123';
  const productId = 'd3b07384-d113-424a-a1d2-06834d858348';

  const movementDto: MovementDto & { tenantId: string } = {
    tenantId,
    typeMovement: EMovementType.IN,
    productId,
    locationId: 'f21a48c9-598d-4a14-8789-08226edb3b0d',
    quantity: 10,
    reason: 'Entrada NF',
  };

  const allocateDto: AllocateLocationDto & { tenantId: string } = {
    tenantId,
    productId,
    targetLocationId: 'loc-target-uuid',
    quantity: 5,
  };

  const mockProduct = {
    id: productId,
    tenantId,
    currentStock: 10,
  } as Product;

  beforeEach(() => {
    mockMovementsRepository = {
      registerMovement: jest.fn(),
      findAllPaginatedByProduct: jest.fn(),
    };

    mockProductsService = {
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      applyStockDelta: jest.fn(),
      findOneBySku: jest.fn(),
      findOneById: jest.fn(),
      findAllProducts: jest.fn(),
      deleteProduct: jest.fn(),
    };

    mockProductLocationsRepository = {
      findByProductAndLocation: jest.fn(),
      incrementQuantity: jest.fn(),
      decrementQuantity: jest.fn(),
      sumAllocatedStock: jest.fn(),
    };

    mockDataSource = {
      transaction: jest
        .fn()
        .mockImplementation(
          async <T>(
            cb: (entityManager: EntityManager) => Promise<T>,
          ): Promise<T> => {
            return await cb(mockEntityManager);
          },
        ),
    };

    service = new MovementsService(
      mockMovementsRepository,
      mockProductsService,
      mockProductLocationsRepository,
      mockDataSource as DataSource,
    );
  });

  describe('registerMovement', () => {
    it('should register IN movement successfully', async () => {
      mockProductsService.applyStockDelta.mockResolvedValue({
        message: 'Success',
        data: { newCurrentStock: 20, uom: 'UN' },
      });

      const result = await service.registerMovement(movementDto);

      expect(result).toEqual({
        message: EMovementsSuccess.CREATE,
        data: null,
      });
      expect(mockProductsService.applyStockDelta).toHaveBeenCalledWith(
        productId,
        tenantId,
        10,
        mockEntityManager,
      );
    });

    it('should register OUT movement using negative delta', async () => {
      const outDto = { ...movementDto, typeMovement: EMovementType.OUT };
      mockProductsService.applyStockDelta.mockResolvedValue({
        message: 'Success',
        data: { newCurrentStock: 0, uom: 'UN' },
      });

      await service.registerMovement(outDto);

      expect(mockProductsService.applyStockDelta).toHaveBeenCalledWith(
        productId,
        tenantId,
        -10,
        mockEntityManager,
      );
    });
  });

  describe('allocateLocation', () => {
    it('should allocate unallocated stock to location successfully', async () => {
      mockProductsService.findOneById.mockResolvedValue(mockProduct);
      mockProductLocationsRepository.sumAllocatedStock.mockResolvedValue(2);

      const result = await service.allocateLocation(allocateDto);

      expect(result).toEqual({
        message: EMovementsSuccess.ALLOCATE_PRODUCT,
        data: null,
      });
      expect(
        mockProductLocationsRepository.incrementQuantity,
      ).toHaveBeenCalledWith(
        productId,
        allocateDto.targetLocationId,
        tenantId,
        5,
        mockEntityManager,
      );
    });

    it('should throw NotFoundException if product is not found', async () => {
      mockProductsService.findOneById.mockResolvedValue(null);

      await expect(service.allocateLocation(allocateDto)).rejects.toThrow(
        new NotFoundException(EProductsErrors.PRODUCT_NOT_FOUND),
      );
    });

    it('should throw BadRequestException when requested quantity exceeds available unallocated stock', async () => {
      mockProductsService.findOneById.mockResolvedValue(mockProduct);
      mockProductLocationsRepository.sumAllocatedStock.mockResolvedValue(8);

      await expect(service.allocateLocation(allocateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should transfer from sourceLocationId to targetLocationId when sourceLocationId is provided', async () => {
      const transferDto = {
        ...allocateDto,
        sourceLocationId: 'loc-source-uuid',
      };
      mockProductsService.findOneById.mockResolvedValue(mockProduct);

      await service.allocateLocation(transferDto);

      expect(
        mockProductLocationsRepository.decrementQuantity,
      ).toHaveBeenCalledWith(
        productId,
        'loc-source-uuid',
        tenantId,
        5,
        mockEntityManager,
      );
      expect(
        mockProductLocationsRepository.incrementQuantity,
      ).toHaveBeenCalledWith(
        productId,
        allocateDto.targetLocationId,
        tenantId,
        5,
        mockEntityManager,
      );
    });
  });

  describe('findAllPaginatedByProduct', () => {
    it('should return paginated movements list when product exists', async () => {
      mockProductsService.findOneById.mockResolvedValue(mockProduct);
      mockMovementsRepository.findAllPaginatedByProduct.mockResolvedValue({
        movements: [],
        total: 0,
      });

      const result = await service.findAllPaginatedByProduct(
        productId,
        tenantId,
        { page: 1, limit: 10 },
      );

      expect(result.message).toBe(EMovementsSuccess.FIND_ALL);
      expect(result.data).toEqual([]);
      expect(result.meta.currentPage).toBe(1);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockProductsService.findOneById.mockResolvedValue(null);

      await expect(
        service.findAllPaginatedByProduct(productId, tenantId, {
          page: 1,
          limit: 10,
        }),
      ).rejects.toThrow(
        new NotFoundException(EProductsErrors.PRODUCT_NOT_FOUND),
      );
    });
  });
});
