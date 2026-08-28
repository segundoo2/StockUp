import { IResponse } from '../../../interfaces/response.interface';
import { LocationDto } from '../dtos/location.dto';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { UpdateDescriptionLocationDto } from '../dtos/update-description-location.dto';
import { Location } from '../entities/location.entity';

export interface IPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ILocationsService {
  createLocation(
    locationDto: LocationDto & { tenantId: string },
  ): Promise<IResponse<null>>;

  findByCode(code: string, tenantId: string): Promise<IResponse<Location>>;

  findAllLocations(
    tenantId: string,
    pagination: PaginationQueryDto,
  ): Promise<IResponse<IPaginatedResponse<Location>>>;

  updateCodeLocation(code: string, tenantId: string): Promise<IResponse<null>>;

  updateDescriptionLocation(
    updateDescriptionLocation: UpdateDescriptionLocationDto,
    tenantId: string,
  ): Promise<IResponse<null>>;

  deleteLocation(code: string, tenantId: string): Promise<IResponse<null>>;
}
