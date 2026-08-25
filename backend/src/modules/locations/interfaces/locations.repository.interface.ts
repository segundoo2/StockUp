import { DeleteResult, UpdateResult } from 'typeorm';
import { LocationDto } from '../dtos/location.dto';
import { Location } from '../entities/location.entity';
import { UpdateDescriptionLocationDto } from '../dtos/update-description-location.dto';

export interface ILocationsRepository {
  createLocation(
    locationDto: LocationDto & { tenantId: string },
  ): Promise<Location>;

  findByCode(code: string, tenantId: string): Promise<Location | null>;

  updateCodeLocation(code: string, tenantId: string): Promise<UpdateResult>;

  updateDescriptionLocation(
    updateDescriptionLocation: UpdateDescriptionLocationDto,
    tenantId: string,
  ): Promise<UpdateResult>;

  deleteLocation(code: string, tenantId: string): Promise<DeleteResult>;
}
