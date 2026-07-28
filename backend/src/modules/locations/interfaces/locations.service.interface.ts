import { IResponse } from '../../../interfaces/response.interface';
import { LocationDto } from '../dtos/location.dto';

export interface ILocationsService {
  createLocation(
    locationDto: LocationDto & { tenantId: string },
  ): Promise<IResponse<null>>;
}
