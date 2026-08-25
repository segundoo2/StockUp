import { ConflictException, NotFoundException } from '@nestjs/common';
import { ELocationSuccessMessage } from '../../../enum/location-success.enum';
import { IResponse } from '../../../interfaces/response.interface';
import { LocationDto } from '../dtos/location.dto';
import { Location } from '../entities/location.entity';
import { ILocationsRepository } from '../interfaces/locations.repository.interface';
import { LocationsService } from '../locations.service';
import { ELocationErrorsMessage } from '../../../enum/location-errors.enum';

describe('LocationsService', () => {
  let service: LocationsService;
  let repository: jest.Mocked<ILocationsRepository>;

  beforeEach(() => {
    repository = {
      createLocation: jest.fn(),
      findByCode: jest.fn(),
      updateCodeLocation: jest.fn(),
      updateDescriptionLocation: jest.fn(),
      deleteLocation: jest.fn(),
    };
    service = new LocationsService(repository);
  });

  const locationDto: LocationDto & { tenantId: string } = {
    tenantId: 'uuid',
    code: 'B1AP001',
    description: 'descrição',
  };
  const response: IResponse<Location | null> = {
    message: ELocationSuccessMessage.CREATE,
    data: null,
  };
  const responseRepository: Location = {
    id: 'uuid',
    tenantId: 'uuid',
    code: 'B1AP001',
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

  describe('updateCodeLocation', () => {
    it(`should return { message: ${ELocationSuccessMessage.UPDATE_CODE}, data: null }`, async () => {
      response.message = ELocationSuccessMessage.UPDATE_CODE;
      response.data = null;
      repository.updateCodeLocation.mockResolvedValue({
        raw: [],
        affected: 1,
        generatedMaps: [],
      });
      expect(
        await service.updateCodeLocation(
          responseRepository.code,
          responseRepository.tenantId,
        ),
      ).toEqual(response);
    });

    it('should return NotFoundException when the location not found', async () => {
      repository.updateCodeLocation.mockResolvedValue({
        raw: [],
        affected: 0,
        generatedMaps: [],
      });
      await expect(
        service.updateCodeLocation(
          responseRepository.code,
          responseRepository.tenantId,
        ),
      ).rejects.toThrow(
        new NotFoundException(ELocationErrorsMessage.NOT_FOUND),
      );
    });
  });

  describe('updateDescriptionLocation', () => {
    it(`should return { message: ${ELocationSuccessMessage.UPDATE_DESCRIPTION}, data: null }`, async () => {
      response.message = ELocationSuccessMessage.UPDATE_DESCRIPTION;
      response.data = null;
      repository.updateDescriptionLocation.mockResolvedValue({
        raw: [],
        affected: 1,
        generatedMaps: [],
      });
      expect(
        await service.updateDescriptionLocation(
          {
            code: responseRepository.code,
            description: responseRepository.description,
          },
          responseRepository.tenantId,
        ),
      ).toEqual(response);
    });

    it('should return NotFoundException when the location not found', async () => {
      repository.updateDescriptionLocation.mockResolvedValue({
        raw: [],
        affected: 0,
        generatedMaps: [],
      });
      await expect(
        service.updateDescriptionLocation(
          {
            code: responseRepository.code,
            description: responseRepository.description,
          },
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
        productLocations: [{} as any],
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
