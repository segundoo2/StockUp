import { ObjectLiteral, Repository } from 'typeorm';
import { LocationsRepository } from '../locations.repository';
import { Location } from '../entities/location.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LocationDto } from '../dtos/location.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { EErrorsGlobal } from '../../../enum/errors-global.enum';

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: Repository<T>[P] extends (
    ...args: infer A
  ) => infer R
    ? jest.Mock<R, A>
    : Repository<T>[P];
};

describe('LocationsRepository', () => {
  let repository: LocationsRepository;
  let repositoryOrm: MockRepository<Location>;

  beforeEach(async () => {
    const mockFactory = (): MockRepository<Location> => ({
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsRepository,
        {
          provide: getRepositoryToken(Location),
          useFactory: mockFactory,
        },
      ],
    }).compile();

    repository = module.get<LocationsRepository>(LocationsRepository);
    repositoryOrm = module.get<MockRepository<Location>>(
      getRepositoryToken(Location),
    );
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

  const locationDto: LocationDto & { tenantId: string } = {
    tenantId: 'uuid',
    code: 'B1AP001',
    description: 'descrição',
  };
  const response: Location = {
    id: 'uuid',
    tenantId: 'uuid',
    code: 'B1AP001',
    description: 'descrição',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('createLocation', () => {
    it('should invoke create and save operations successfully', async () => {
      repositoryOrm.save?.mockResolvedValue(response);
      expect(await repository.createLocation(locationDto)).toEqual(response);
    });

    shouldHandleDatabaseErrors(
      () => repository.createLocation(locationDto),
      () => repositoryOrm.save,
    );
  });

  describe('findByCode', () => {
    it('It should return a location object when it is found', async () => {
      repositoryOrm.findOne?.mockResolvedValue(response);
      expect(
        await repository.findByCode(locationDto.code, locationDto.tenantId),
      ).toEqual(response);
    });

    shouldHandleDatabaseErrors(
      () => repository.findByCode(locationDto.code, locationDto.tenantId),
      () => repositoryOrm.findOne,
    );
  });

  describe('updateCodeLocation', () => {
    it('should return { raw [], affected: 1, generatedMaps: [] } when location found and updated', async () => {
      repositoryOrm.update?.mockResolvedValue({
        raw: [],
        affected: 1,
        generatedMaps: [],
      });
      expect(
        await repository.updateCodeLocation(response.code, response.tenantId),
      ).toEqual({ raw: [], affected: 1, generatedMaps: [] });
    });

    shouldHandleDatabaseErrors(
      () =>
        repository.updateCodeLocation(locationDto.code, locationDto.tenantId),
      () => repositoryOrm.update,
    );
  });

  describe('updateDescriptionLocation', () => {
    it('should return { raw [], affected: 1, generatedMaps: [] } when location found and updated', async () => {
      repositoryOrm.update?.mockResolvedValue({
        raw: [],
        affected: 1,
        generatedMaps: [],
      });
      expect(
        await repository.updateDescriptionLocation(
          { code: response.code, description: response.description },
          response.tenantId,
        ),
      ).toEqual({ raw: [], affected: 1, generatedMaps: [] });
    });

    shouldHandleDatabaseErrors(
      () =>
        repository.updateDescriptionLocation(
          { code: locationDto.code, description: locationDto.description },
          locationDto.tenantId,
        ),
      () => repositoryOrm.update,
    );
  });

  describe('deleteLocation', () => {
    it('should return { raw [], affected: 1, generatedMaps: [] } when location found and deleted', async () => {
      repositoryOrm.delete?.mockResolvedValue({
        raw: [],
        affected: 1,
      });
      expect(
        await repository.deleteLocation(response.code, response.tenantId),
      ).toEqual({ raw: [], affected: 1 });
    });

    shouldHandleDatabaseErrors(
      () => repository.deleteLocation(locationDto.code, locationDto.tenantId),
      () => repositoryOrm.delete,
    );
  });
});
