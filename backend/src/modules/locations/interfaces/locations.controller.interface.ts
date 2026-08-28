import { IResponse } from '../../../interfaces/response.interface';
import { LocationDto } from '../dtos/location.dto';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { UpdateDescriptionLocationDto } from '../dtos/update-description-location.dto';
import { Location } from '../entities/location.entity';
import { IPaginatedResponse } from './locations.service.interface';

export interface ILocationsController {
  createLocation(
    tenantId: string,
    locationDto: LocationDto,
  ): Promise<IResponse<null>>;

  findByCode(code: string, tenantId: string): Promise<IResponse<Location>>;

  findAllLocations(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<IResponse<IPaginatedResponse<Location>>>;

  updateCodeLocation(code: string, tenantId: string): Promise<IResponse<null>>;

  updateDescriptionLocation(
    updateDescriptionLocation: UpdateDescriptionLocationDto,
    tenantId: string,
  ): Promise<IResponse<null>>;

  deleteLocation(code: string, tenantId: string): Promise<IResponse<null>>;
}
