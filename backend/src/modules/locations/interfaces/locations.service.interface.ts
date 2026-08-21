import { IResponse } from '../../../interfaces/response.interface';
import { LocationDto } from '../dtos/location.dto';
import { Location } from '../entities/location.entity';

export interface ILocationsService {
  createLocation(
    locationDto: LocationDto & { tenantId: string },
  ): Promise<IResponse<null>>;

  findByCode(code: string, tenantId: string): Promise<IResponse<Location>>;
}
