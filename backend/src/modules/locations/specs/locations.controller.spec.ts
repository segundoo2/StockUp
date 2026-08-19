import { ELocationSuccessMessage } from '../../../enum/location-success.enum';
import { IResponse } from '../../../interfaces/response.interface';
import { LocationDto } from '../dtos/location.dto';
import { ILocationsService } from '../interfaces/locations.service.interface';
import { LocationsController } from '../locations.controller';

describe('LocationController', () => {
  let controller: LocationsController;
  let service: jest.Mocked<ILocationsService>;

  beforeEach(() => {
    service = {
      createLocation: jest.fn(),
    };
    controller = new LocationsController(service);
  });

  const tenantId: string = 'uuid';
  const locationDto: LocationDto = {
    code: 'B1AP001',
    description: 'descrição',
  };
  const response: IResponse<null> = {
    message: ELocationSuccessMessage.CREATE,
    data: null,
  };

  describe('createLocation', () => {
    it(`should return the object {message: ${ELocationSuccessMessage.CREATE}, data: null}`, async () => {
      service.createLocation.mockResolvedValue(response);
      expect(await controller.createLocation(tenantId, locationDto)).toEqual(
        response,
      );
    });
  });
});
