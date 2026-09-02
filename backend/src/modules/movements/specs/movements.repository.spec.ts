/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { EMovementType, MovementDto } from '../dtos/movement.dto';
import { Movement } from '../entities/movement.entity';
import { MovementsRepository } from '../movements.repository';

type MockRepository<T extends object = object> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe('MovementsRepository', () => {
  let repository: MovementsRepository;
  let ormMock: MockRepository<Movement>;

  const movementDto: MovementDto & { tenantId: string } = {
    tenantId: 'tenant-uuid-123',
    typeMovement: EMovementType.IN,
    productId: 'd3b07384-d113-424a-a1d2-06834d858348',
    locationId: 'f21a48c9-598d-4a14-8789-08226edb3b0d',
    quantity: 10,
    reason: 'Entrada de nota fiscal de compra',
  };

  const mockEntity = {
    id: '123-uuid',
    ...movementDto,
  } as Movement;

  beforeEach(async () => {
    ormMock = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovementsRepository,
        {
          provide: getRepositoryToken(Movement),
          useValue: ormMock,
        },
      ],
    }).compile();

    repository = module.get<MovementsRepository>(MovementsRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerMovement', () => {
    it('should register movement successfully using default repository', async () => {
      ormMock.create?.mockReturnValue(mockEntity);
      ormMock.save?.mockResolvedValue(mockEntity);

      await expect(
        repository.registerMovement(movementDto),
      ).resolves.not.toThrow();

      expect(ormMock.create).toHaveBeenCalledWith(movementDto);
      expect(ormMock.create).toHaveBeenCalledTimes(1);
      expect(ormMock.save).toHaveBeenCalledWith(mockEntity);
      expect(ormMock.save).toHaveBeenCalledTimes(1);
    });

    it('should register movement using transactional EntityManager repository when provided', async () => {
      const mockTxRepository = {
        create: jest.fn().mockReturnValue(mockEntity),
        save: jest.fn().mockResolvedValue(mockEntity),
      };

      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue(mockTxRepository),
      } as unknown as EntityManager;

      await expect(
        repository.registerMovement(movementDto, mockEntityManager),
      ).resolves.not.toThrow();

      expect(mockEntityManager.getRepository).toHaveBeenCalledWith(Movement);
      expect(mockTxRepository.create).toHaveBeenCalledWith(movementDto);
      expect(mockTxRepository.save).toHaveBeenCalledWith(mockEntity);
      expect(ormMock.create).not.toHaveBeenCalled();
      expect(ormMock.save).not.toHaveBeenCalled();
    });

    it('should throw error when repository save fails', async () => {
      const dbError = new Error('Database insertion failed');
      ormMock.create?.mockReturnValue(mockEntity);
      ormMock.save?.mockRejectedValue(dbError);

      await expect(repository.registerMovement(movementDto)).rejects.toThrow(
        dbError,
      );
    });
  });
});
