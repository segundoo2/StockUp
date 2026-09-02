/* eslint-disable @typescript-eslint/unbound-method */
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { IResponse } from '../../../common/interfaces/response.interface';
import { MovementDto, EMovementType } from '../dtos/movement.dto';
import { IMovementsService } from '../interfaces/movements.service.interface';
import { EMovementsSuccess } from '../../../common/enum/movements-success.enum';
import { EProductsErrors } from '../../../common/enum/products-errors.enum';
import { EErrorsGlobal } from '../../../common/enum/errors-global.enum';
import { IMovementsRepository } from '../interfaces/movements.repository.interface';
import { IProductsService } from '../../products/interfaces/products.service.interface';
import { MovementsService } from '../movements.service';

describe('MovementsService', () => {
  let service: IMovementsService;
  let mockMovementsRepository: jest.Mocked<IMovementsRepository>;
  let mockProductsService: jest.Mocked<IProductsService>;
  let mockDataSource: Partial<DataSource>;

  const mockEntityManager = {} as EntityManager;

  const movementDto: MovementDto & { tenantId: string } = {
    tenantId: 'tenant-uuid-123',
    typeMovement: EMovementType.IN,
    productId: 'd3b07384-d113-424a-a1d2-06834d858348',
    locationId: 'f21a48c9-598d-4a14-8789-08226edb3b0d',
    quantity: 10,
    reason: 'Entrada de nota fiscal de compra',
  };

  const expectedResponse: IResponse<null> = {
    message: EMovementsSuccess.CREATE,
    data: null,
  };

  beforeEach(() => {
    mockMovementsRepository = {
      registerMovement: jest.fn(),
    };

    mockProductsService = {
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      applyStockDelta: jest.fn(),
      findOneBySku: jest.fn(),
      findAllProducts: jest.fn(),
      deleteProduct: jest.fn(),
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
      mockDataSource as DataSource,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerMovement', () => {
    it('should register stock movement and apply stock delta successfully within transaction for IN movement', async () => {
      mockProductsService.applyStockDelta.mockResolvedValue({
        message: 'Success',
        data: { newCurrentStock: 20, uom: 'UN' },
      });
      mockMovementsRepository.registerMovement.mockResolvedValue();

      const result = await service.registerMovement(movementDto);

      expect(result).toEqual(expectedResponse);
      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockProductsService.applyStockDelta).toHaveBeenCalledWith(
        movementDto.productId,
        movementDto.tenantId,
        10,
        mockEntityManager,
      );
      expect(mockMovementsRepository.registerMovement).toHaveBeenCalledWith(
        movementDto,
        mockEntityManager,
      );
    });

    it('should apply negative stock delta when movement type is OUT', async () => {
      const outMovementDto = {
        ...movementDto,
        typeMovement: EMovementType.OUT,
      };

      mockProductsService.applyStockDelta.mockResolvedValue({
        message: 'Success',
        data: { newCurrentStock: 0, uom: 'UN' },
      });
      mockMovementsRepository.registerMovement.mockResolvedValue();

      await service.registerMovement(outMovementDto);

      expect(mockProductsService.applyStockDelta).toHaveBeenCalledWith(
        outMovementDto.productId,
        outMovementDto.tenantId,
        -10,
        mockEntityManager,
      );
    });

    // --- CAMINHOS DE ERRO (EXCEÇÕES E TRONCAMENTO DA TRANSAÇÃO) ---

    it('should throw BadRequestException when applyStockDelta fails due to insufficient stock', async () => {
      const outMovementDto = {
        ...movementDto,
        typeMovement: EMovementType.OUT,
        quantity: 50,
      };

      mockProductsService.applyStockDelta.mockRejectedValue(
        new BadRequestException(
          `${EProductsErrors.PRODUCT_QUANTITY_INVALID} 10 UN`,
        ),
      );

      await expect(service.registerMovement(outMovementDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockProductsService.applyStockDelta).toHaveBeenCalledWith(
        outMovementDto.productId,
        outMovementDto.tenantId,
        -50,
        mockEntityManager,
      );
      expect(mockMovementsRepository.registerMovement).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when product does not exist during stock delta update', async () => {
      mockProductsService.applyStockDelta.mockRejectedValue(
        new NotFoundException(EProductsErrors.PRODUCT_NOT_FOUND),
      );

      await expect(service.registerMovement(movementDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockMovementsRepository.registerMovement).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when registerMovement in repository fails', async () => {
      mockProductsService.applyStockDelta.mockResolvedValue({
        message: 'Success',
        data: { newCurrentStock: 20, uom: 'UN' },
      });
      mockMovementsRepository.registerMovement.mockRejectedValue(
        new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR),
      );

      await expect(service.registerMovement(movementDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockProductsService.applyStockDelta).toHaveBeenCalledTimes(1);
      expect(mockMovementsRepository.registerMovement).toHaveBeenCalledTimes(1);
    });
  });
});
