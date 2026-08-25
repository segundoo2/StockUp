import { IResponse } from '../../../interfaces/response.interface';
import { LocationDto } from '../dtos/location.dto';
import { Location } from '../entities/location.entity';

export interface ILocationsController {
  createLocation(
    tenantId: string,
    locationDto: LocationDto,
  ): Promise<IResponse<null>>;

  findByCode(code: string, tenantId: string): Promise<IResponse<Location>>;

  updateCodeLocation(code: string, tenantId: string): Promise<IResponse<null>>;
}
