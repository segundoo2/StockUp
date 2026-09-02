import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EMovementType, MovementDto } from '../dtos/movement.dto';
import { Movement } from '../entities/movement.entity';
import { MovementsRepository } from '../movements.repository';
import { InternalServerErrorException } from '@nestjs/common';
import { EErrorsGlobal } from '../../../common/enum/errors-global.enum';

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

  afterEach(() => jest.restoreAllMocks());

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

  describe('registerMovement', () => {
    it('it should register movement with success', async () => {
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

    shouldHandleDatabaseErrors(
      () => repository.registerMovement(movementDto),
      () => ormMock.save,
    );
  });
});
