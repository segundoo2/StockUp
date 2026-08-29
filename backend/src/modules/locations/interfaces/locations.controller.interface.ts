import { PaginationQueryDto } from '../../../common/dtos/pagination-query.dto';
import { IPaginatedResponse } from '../../../common/interfaces/paginated-response.interface';
import { IResponse } from '../../../common/interfaces/response.interface';
import { LocationDto } from '../dtos/location.dto';
import { UpdateDescriptionLocationDto } from '../dtos/update-description-location.dto';
import { Location } from '../entities/location.entity';

export interface ILocationsController {
  createLocation(
    tenantId: string,
    locationDto: LocationDto,
  ): Promise<IResponse<null>>;

  findByCode(code: string, tenantId: string): Promise<IResponse<Location>>;

  findAllLocations(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<IPaginatedResponse<Location>>;

  updateCodeLocation(code: string, tenantId: string): Promise<IResponse<null>>;

  updateDescriptionLocation(
    updateDescriptionLocation: UpdateDescriptionLocationDto,
    tenantId: string,
  ): Promise<IResponse<null>>;

  deleteLocation(code: string, tenantId: string): Promise<IResponse<null>>;
}
