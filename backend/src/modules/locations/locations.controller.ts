import { BadRequestException, Controller, Inject } from '@nestjs/common';
import { ILocationsController } from './interfaces/locations.controller.interface';
import type { ILocationsService } from './interfaces/locations.service.interface';
import { IResponse } from '../../interfaces/response.interface';
import { LocationDto } from './dtos/location.dto';
import { Location } from './entities/location.entity';
import { TenantId } from '../../decorators/tenant-id.decorator';
import { EErrorsGlobal } from '../../enum/errors-global.enum';
import { UpdateDescriptionLocationDto } from './dtos/update-description-location.dto';

@Controller('locations')
export class LocationsController implements ILocationsController {
  constructor(
    @Inject('ILocationsService')
    private readonly service: ILocationsService,
  ) {}

  async createLocation(
    tenantId: string,
    @TenantId()
    locationDto: LocationDto,
  ): Promise<IResponse<null>> {
    return await this.service.createLocation({ ...locationDto, tenantId });
  }

  async findByCode(
    code: string,
    @TenantId()
    tenantId: string,
  ): Promise<IResponse<Location>> {
    if (!code && !tenantId) {
      throw new BadRequestException(EErrorsGlobal.INVALID_DATA);
    }
    return await this.service.findByCode(code, tenantId);
  }

  async updateCodeLocation(
    code: string,
    @TenantId()
    tenantId: string,
  ): Promise<IResponse<null>> {
    if (!code && !tenantId) {
      throw new BadRequestException(EErrorsGlobal.INVALID_DATA);
    }
    return await this.service.updateCodeLocation(code, tenantId);
  }

  async updateDescriptionLocation(
    updateDescriptionLocation: UpdateDescriptionLocationDto,
    @TenantId()
    tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.service.updateDescriptionLocation(
      updateDescriptionLocation,
      tenantId,
    );
  }
}
