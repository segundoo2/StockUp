import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ILocationsService } from './interfaces/locations.service.interface';
import type { ILocationsRepository } from './interfaces/locations.repository.interface';
import { IResponse } from '../../interfaces/response.interface';
import { LocationDto } from './dtos/location.dto';
import { ELocationSuccessMessage } from '../../enum/location-success.enum';
import { Location } from './entities/location.entity';
import { ELocationErrorsMessage } from '../../enum/location-errors.enum';

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
}
