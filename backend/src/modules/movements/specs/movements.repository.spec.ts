import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EErrorsGlobal } from '../../../common/enum/errors-global.enum';
import { EMovementType, MovementDto } from '../dtos/movement.dto';
import { Movement } from '../entities/movement.entity';
import { MovementsRepository } from '../movements.repository';

type MockRepository<T extends object = object> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe('MovementsRepository', () => {
  let repository: MovementsRepository;
  let ormMock: MockRepository<Movement>;

  const tenantId = 'tenant-uuid-123';
  const productId = 'd3b07384-d113-424a-a1d2-06834d858348';

  const movementDto: MovementDto & { tenantId: string } = {
    tenantId,
    typeMovement: EMovementType.IN,
    productId,
    locationId: 'f21a48c9-598d-4a14-8789-08226edb3b0d',
    quantity: 10,
  };

  const mockEntity = {
    id: '123-uuid',
    ...movementDto,
  } as Movement;

  beforeEach(async () => {
    ormMock = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
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

  describe('registerMovement', () => {
    it('should register movement successfully', async () => {
      ormMock.create?.mockReturnValue(mockEntity);
      ormMock.save?.mockResolvedValue(mockEntity);

      await expect(
        repository.registerMovement(movementDto),
      ).resolves.not.toThrow();

      expect(ormMock.save).toHaveBeenCalledWith(mockEntity);
    });

    it('should throw InternalServerErrorException when save fails', async () => {
      ormMock.create?.mockReturnValue(mockEntity);
      ormMock.save?.mockRejectedValue(new Error('DB Error'));

      await expect(repository.registerMovement(movementDto)).rejects.toThrow(
        new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR),
      );
    });
  });

  describe('findAllPaginatedByProduct', () => {
    it('should return paginated movements list and total', async () => {
      ormMock.findAndCount?.mockResolvedValue([[mockEntity], 1]);

      const result = await repository.findAllPaginatedByProduct(
        productId,
        tenantId,
        1,
        10,
      );

      expect(result).toEqual({ movements: [mockEntity], total: 1 });
      expect(ormMock.findAndCount).toHaveBeenCalledWith({
        where: { productId, tenantId },
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
        relations: { location: true },
      });
    });

    it('should throw InternalServerErrorException when findAndCount fails', async () => {
      ormMock.findAndCount?.mockRejectedValue(new Error('DB Error'));

      await expect(
        repository.findAllPaginatedByProduct(productId, tenantId, 1, 10),
      ).rejects.toThrow(
        new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR),
      );
    });
  });
});
