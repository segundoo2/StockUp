import { DeleteResult, UpdateResult } from 'typeorm';
import { Location } from '../entities/location.entity';
import { LocationDto } from '../dtos/location.dto';
import { UpdateLocationDto } from '../dtos/update-location.dto';

export interface ILocationsRepository {
  createLocation(
    locationDto: LocationDto & { tenantId: string },
  ): Promise<Location>;

  findByCode(code: string, tenantId: string): Promise<Location | null>;

  findAllPaginated(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<{ locations: Location[]; total: number }>;

  updateLocation(
    code: string,
    updateLocationDto: UpdateLocationDto,
    tenantId: string,
  ): Promise<UpdateResult>;

  deleteLocation(code: string, tenantId: string): Promise<DeleteResult>;
}
