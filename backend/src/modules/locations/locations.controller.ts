import { Controller, Inject } from '@nestjs/common';
import { ILocationsController } from './interfaces/locations.controller.interface';
import type { ILocationsService } from './interfaces/locations.service.interface';
import { IResponse } from '../../interfaces/response.interface';
import { LocationDto } from './dtos/location.dto';
import { Location } from './entities/location.entity';

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

  async findByCode(
    code: string,
    tenantId: string,
  ): Promise<IResponse<Location>> {
    return await this.service.findByCode(code, tenantId);
  }
}
