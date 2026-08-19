import { Inject, Injectable } from '@nestjs/common';
import { ILocationsService } from './interfaces/locations.service.interface';
import type { ILocationsRepository } from './interfaces/locations.repository.interface';
import { IResponse } from '../../interfaces/response.interface';
import { LocationDto } from './dtos/location.dto';
import { ELocationSuccessMessage } from '../../enum/location-success.enum';

@Injectable()
export class LocationsService implements ILocationsService {
  constructor(
    @Inject('ILocationsRepository')
    private readonly repository: ILocationsRepository,
  ) {}

  async createLocation(
    locationDto: LocationDto & { tenantId: string },
  ): Promise<IResponse<null>> {
    await this.repository.createLocation(locationDto);
    return {
      message: ELocationSuccessMessage.CREATE,
      data: null,
    };
  }
}
