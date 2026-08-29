import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ILocationsService } from './interfaces/locations.service.interface';
import type { ILocationsRepository } from './interfaces/locations.repository.interface';
import { IResponse } from '../../common/interfaces/response.interface';
import { LocationDto } from './dtos/location.dto';
import { ELocationSuccessMessage } from '../../common/enum/location-success.enum';
import { Location } from './entities/location.entity';
import { ELocationErrorsMessage } from '../../common/enum/location-errors.enum';
import { UpdateDescriptionLocationDto } from './dtos/update-description-location.dto';
import { PaginationQueryDto } from '../../common/dtos/pagination-query.dto';
import { IPaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@Injectable()
export class LocationsService implements ILocationsService {
  constructor(
    @Inject('ILocationsRepository')
    private readonly repository: ILocationsRepository,
  ) {}

  async createLocation(
    locationDto: LocationDto & { tenantId: string },
  ): Promise<IResponse<null>> {
    const findLocation: Location | null = await this.repository.findByCode(
      locationDto.code,
      locationDto.tenantId,
    );
    if (findLocation) {
      throw new ConflictException(ELocationErrorsMessage.CONFLICT);
    }
    await this.repository.createLocation(locationDto);
    return {
      message: ELocationSuccessMessage.CREATE,
      data: null,
    };
  }

  async findByCode(
    code: string,
    tenantId: string,
  ): Promise<IResponse<Location>> {
    const locationFound: Location | null = await this.repository.findByCode(
      code,
      tenantId,
    );
    if (!locationFound) {
      throw new NotFoundException(ELocationErrorsMessage.NOT_FOUND);
    }
    return {
      message: ELocationSuccessMessage.FINDONE,
      data: locationFound,
    };
  }

  async findAllLocations(
    tenantId: string,
    pagination: PaginationQueryDto,
  ): Promise<IPaginatedResponse<Location>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    const { locations, total } = await this.repository.findAllPaginated(
      tenantId,
      page,
      limit,
    );

    if (locations.length === 0) {
      throw new NotFoundException(ELocationErrorsMessage.NOT_FOUND);
    }

    const totalPages = Math.ceil(total / limit);

    return {
      message: ELocationSuccessMessage.FIND_ALL,
      data: locations,
      meta: {
        itemCount: locations.length,
        totalItems: total,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async updateCodeLocation(
    code: string,
    tenantId: string,
  ): Promise<IResponse<null>> {
    const updatedLocation = await this.repository.updateCodeLocation(
      code,
      tenantId,
    );
    if (updatedLocation.affected === 0) {
      throw new NotFoundException(ELocationErrorsMessage.NOT_FOUND);
    }
    return { message: ELocationSuccessMessage.UPDATE_CODE, data: null };
  }

  async updateDescriptionLocation(
    updateDescriptionLocation: UpdateDescriptionLocationDto,
    tenantId: string,
  ): Promise<IResponse<null>> {
    const updatedDescriptionLocation =
      await this.repository.updateDescriptionLocation(
        updateDescriptionLocation,
        tenantId,
      );
    if (updatedDescriptionLocation.affected === 0) {
      throw new NotFoundException(ELocationErrorsMessage.NOT_FOUND);
    }
    return {
      message: ELocationSuccessMessage.UPDATE_DESCRIPTION,
      data: null,
    };
  }

  async deleteLocation(
    code: string,
    tenantId: string,
  ): Promise<IResponse<null>> {
    const productListLocation = await this.repository.findByCode(
      code,
      tenantId,
    );
    if (
      productListLocation?.productLocations &&
      productListLocation.productLocations.length > 0
    ) {
      throw new ConflictException(ELocationErrorsMessage.CONFLICT_DELETE);
    }
    const deletedLocation = await this.repository.deleteLocation(
      code,
      tenantId,
    );
    if (deletedLocation.affected === 0) {
      throw new NotFoundException(ELocationErrorsMessage.NOT_FOUND);
    }
    return {
      message: ELocationSuccessMessage.DELETE,
      data: null,
    };
  }
}
