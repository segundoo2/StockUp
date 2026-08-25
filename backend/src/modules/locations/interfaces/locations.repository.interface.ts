import { UpdateResult } from 'typeorm';
import { LocationDto } from '../dtos/location.dto';
import { Location } from '../entities/location.entity';

export interface ILocationsRepository {
  createLocation(
    locationDto: LocationDto & { tenantId: string },
  ): Promise<Location>;

  updateLocation(id: string, tenantId: string): Promise<UpdateResult>;

  findByCode(code: string, tenantId: string): Promise<Location | null>;
}
