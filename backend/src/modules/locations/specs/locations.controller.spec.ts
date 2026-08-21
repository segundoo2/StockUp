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
});
