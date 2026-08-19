import { ELocationSuccessMessage } from '../../../enum/location-success.enum';
import { IResponse } from '../../../interfaces/response.interface';
import { LocationDto } from '../dtos/location.dto';
import { Location } from '../entities/location.entity';
import { ILocationsRepository } from '../interfaces/locations.repository.interface';
import { LocationsService } from '../locations.service';

describe('LocationsService', () => {
  let service: LocationsService;
  let repository: jest.Mocked<ILocationsRepository>;

  beforeEach(() => {
    repository = {
      createLocation: jest.fn(),
    };
    service = new LocationsService(repository);
  });

  const locationDto: LocationDto & { tenantId: string } = {
    tenantId: 'uuid',
    code: 'B1AP001',
    description: 'descrição',
  };
  const response: IResponse<null> = {
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
  });
});
