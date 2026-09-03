import { ConflictException, NotFoundException } from '@nestjs/common';
import { ELocationSuccessMessage } from '../../../common/enum/location-success.enum';
import { IResponse } from '../../../common/interfaces/response.interface';
import { LocationDto } from '../dtos/location.dto';
import { UpdateLocationDto } from '../dtos/update-location.dto';
import { ELocationType, Location } from '../entities/location.entity';
import { ILocationsRepository } from '../interfaces/locations.repository.interface';
import { LocationsService } from '../locations.service';
import { ELocationErrorsMessage } from '../../../common/enum/location-errors.enum';
import { ProductLocation } from '../entities/product-location.entity';

describe('LocationsService', () => {
  let service: LocationsService;
  let repository: jest.Mocked<ILocationsRepository>;

  beforeEach(() => {
    repository = {
      createLocation: jest.fn(),
      findByCode: jest.fn(),
      findAllPaginated: jest.fn(),
      updateLocation: jest.fn(),
      deleteLocation: jest.fn(),
    };
    service = new LocationsService(repository);
  });

  const locationDto: LocationDto & { tenantId: string } = {
    tenantId: 'uuid',
    code: 'B1AP001',
    type: ELocationType.STORAGE,
    description: 'descrição',
  };
  const updateLocationDto: UpdateLocationDto = {
    description: 'nova descrição',
  };
  const response: IResponse<Location | null> = {
    message: ELocationSuccessMessage.CREATE,
    data: null,
  };
  const responseRepository: Location = {
    id: 'uuid',
    tenantId: 'uuid',
    code: 'B1AP001',
    type: ELocationType.STORAGE,
    description: 'descrição',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('createLocation', () => {
    it(`should return the object {message: ${ELocationSuccessMessage.CREATE}, data: null}`, async () => {
      repository.createLocation.mockResolvedValue(responseRepository);
      expect(await service.createLocation(locationDto)).toEqual(response);
    });

    it('should return ConflictException when location exist', async () => {
      repository.findByCode.mockResolvedValue(responseRepository);
      await expect(service.createLocation(locationDto)).rejects.toThrow(
        new ConflictException(ELocationErrorsMessage.CONFLICT),
      );
    });
  });

  describe('findByCode', () => {
    it(`should return { message: ${ELocationSuccessMessage.FINDONE}, data: Location } when the location is found`, async () => {
      response.message = ELocationSuccessMessage.FINDONE;
      response.data = responseRepository;
      repository.findByCode.mockResolvedValue(responseRepository);
      expect(
        await service.findByCode(
          responseRepository.code,
          responseRepository.tenantId,
        ),
      ).toEqual(response);
    });

    it('should return NotFoundException when location not found', async () => {
      repository.findByCode.mockResolvedValue(null);
      await expect(
        service.findByCode(
          responseRepository.code,
          responseRepository.tenantId,
        ),
      ).rejects.toThrow(
        new NotFoundException(ELocationErrorsMessage.NOT_FOUND),
      );
    });
  });

  describe('findAllLocations', () => {
    it('should return paginated response structure', async () => {
      const locationsList = [responseRepository];
      repository.findAllPaginated.mockResolvedValue({
        locations: locationsList,
        total: 1,
      });

      const expectedResult = {
        message: ELocationSuccessMessage.FIND_ALL,
        data: locationsList,
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      expect(
        await service.findAllLocations('uuid', { page: 1, limit: 10 }),
      ).toEqual(expectedResult);
    });
  });

  describe('updateLocation', () => {
    it(`should return { message: ${ELocationSuccessMessage.UPDATE}, data: null }`, async () => {
      response.message = ELocationSuccessMessage.UPDATE;
      response.data = null;
      repository.updateLocation.mockResolvedValue({
        raw: [],
        affected: 1,
        generatedMaps: [],
      });
      expect(
        await service.updateLocation(
          responseRepository.code,
          updateLocationDto,
          responseRepository.tenantId,
        ),
      ).toEqual(response);
    });

    it('should return NotFoundException when the location not found', async () => {
      repository.updateLocation.mockResolvedValue({
        raw: [],
        affected: 0,
        generatedMaps: [],
      });
      await expect(
        service.updateLocation(
          responseRepository.code,
          updateLocationDto,
          responseRepository.tenantId,
        ),
      ).rejects.toThrow(
        new NotFoundException(ELocationErrorsMessage.NOT_FOUND),
      );
    });
  });

  describe('deleteLocation', () => {
    it(`should return { message: ${ELocationSuccessMessage.DELETE}, data: null }`, async () => {
      response.message = ELocationSuccessMessage.DELETE;
      response.data = null;
      repository.deleteLocation.mockResolvedValue({
        raw: [],
        affected: 1,
      });
      expect(
        await service.deleteLocation(
          responseRepository.code,
          responseRepository.tenantId,
        ),
      ).toEqual(response);
    });

    it('should return ConflictException when the location has products associated', async () => {
      repository.findByCode.mockResolvedValue({
        ...responseRepository,
        productLocations: [{} as ProductLocation],
      });
      await expect(
        service.deleteLocation(
          responseRepository.code,
          responseRepository.tenantId,
        ),
      ).rejects.toThrow(
        new ConflictException(ELocationErrorsMessage.CONFLICT_DELETE),
      );
    });

    it('should return NotFoundException when the location not found', async () => {
      repository.deleteLocation.mockResolvedValue({
        raw: [],
        affected: 0,
      });
      await expect(
        service.deleteLocation(
          responseRepository.code,
          responseRepository.tenantId,
        ),
      ).rejects.toThrow(
        new NotFoundException(ELocationErrorsMessage.NOT_FOUND),
      );
    });
  });
});
