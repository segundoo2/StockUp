import { Controller, Inject } from '@nestjs/common';
import { ILocationsController } from './interfaces/locations.controller.interface';
import type { ILocationsService } from './interfaces/locations.service.interface';
import { IResponse } from '../../interfaces/response.interface';
import { LocationDto } from './dtos/location.dto';

@Controller('locations')
export class LocationsController implements ILocationsController {
  constructor(
    @Inject('ILocationsService')
    private readonly service: ILocationsService,
  ) {}

  async createLocation(
    tenantId: string,
    locationDto: LocationDto,
  ): Promise<IResponse<null>> {
    return await this.service.createLocation({ ...locationDto, tenantId });
  }
}
