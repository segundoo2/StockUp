import { LocationDto } from '../dtos/location.dto';
import { Location } from '../entities/location.entity';

export interface ILocationsRepository {
  createLocation(
    locationDto: LocationDto & { tenantId: string },
  ): Promise<Location>;
}
