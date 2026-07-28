import { IResponse } from '../../../interfaces/response.interface';
import { LocationDto } from '../dtos/location.dto';

export interface ILocationsController {
  createLocation(
    tenantId: string,
    locationDto: LocationDto,
  ): Promise<IResponse<null>>;
}
