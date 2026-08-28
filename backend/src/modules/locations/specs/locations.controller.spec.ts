import { ELocationSuccessMessage } from '../../../enum/location-success.enum';
import { IResponse } from '../../../interfaces/response.interface';
import { LocationDto } from '../dtos/location.dto';
import { Location } from '../entities/location.entity';
import { ILocationsService } from '../interfaces/locations.service.interface';
import { LocationsController } from '../locations.controller';

describe('LocationController', () => {
  let controller: LocationsController;
  let service: jest.Mocked<ILocationsService>;

  beforeEach(() => {
    service = {
      createLocation: jest.fn(),
      findByCode: jest.fn(),
      findAllLocations: jest.fn(),
      updateCodeLocation: jest.fn(),
      updateDescriptionLocation: jest.fn(),
      deleteLocation: jest.fn(),
    };
    controller = new LocationsController(service);
  });

  const tenantId: string = 'uuid';
  const locationDto: LocationDto = {
    code: 'B1AP001',
    description: 'descrição',
  };
  const response: IResponse<Location | null> = {
    message: ELocationSuccessMessage.CREATE,
    data: null,
  };
  const responseService: Location = {
    id: 'uuid',
    tenantId: 'uuid',
    code: 'B1AP001',
    description: 'descrição',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('createLocation', () => {
    it(`should return the object {message: ${ELocationSuccessMessage.CREATE}, data: null}`, async () => {
      service.createLocation.mockResolvedValue(response as IResponse<null>);
      expect(await controller.createLocation(tenantId, locationDto)).toEqual(
        response,
      );
    });
  });

  describe('findByCode', () => {
    it(`should return { message: ${ELocationSuccessMessage.FINDONE}, data: Location } when Location is found`, async () => {
      response.data = responseService;
      service.findByCode.mockResolvedValue(response as IResponse<Location>);
      expect(
        await controller.findByCode(
          responseService.code,
          responseService.tenantId,
        ),
      ).toEqual(response);
    });
  });

  describe('findAllLocations', () => {
    it('should return paginated response from service', async () => {
      const expectedResponse = {
        message: ELocationSuccessMessage.FIND_ALL,
        data: {
          data: [responseService],
          meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
      };

      service.findAllLocations.mockResolvedValue(expectedResponse);

      expect(
        await controller.findAllLocations(tenantId, { page: 1, limit: 10 }),
      ).toEqual(expectedResponse);
    });
  });

  describe('updateCodeLocation', () => {
    it(`should return { message: ${ELocationSuccessMessage.UPDATE_CODE}, data: null }`, async () => {
      response.message = ELocationSuccessMessage.UPDATE_CODE;
      service.updateCodeLocation.mockResolvedValue(response as IResponse<null>);
      expect(
        await controller.updateCodeLocation(
          responseService.code,
          responseService.tenantId,
        ),
      ).toEqual(response);
    });
  });

  describe('updateDescriptionLocation', () => {
    it(`should return { message: ${ELocationSuccessMessage.UPDATE_DESCRIPTION}, data: null }`, async () => {
      response.message = ELocationSuccessMessage.UPDATE_DESCRIPTION;
      service.updateDescriptionLocation.mockResolvedValue(
        response as IResponse<null>,
      );
      expect(
        await controller.updateDescriptionLocation(
          {
            code: responseService.code,
            description: responseService.description,
          },
          responseService.tenantId,
        ),
      ).toEqual(response);
    });
  });

  describe('deleteLocation', () => {
    it(`should return { message: ${ELocationSuccessMessage.DELETE}, data: null }`, async () => {
      response.message = ELocationSuccessMessage.DELETE;
      service.deleteLocation.mockResolvedValue(response as IResponse<null>);
      expect(
        await controller.deleteLocation(
          responseService.code,
          responseService.tenantId,
        ),
      ).toEqual(response);
    });
  });
});
