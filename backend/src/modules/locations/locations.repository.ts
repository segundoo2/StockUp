import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { ILocationsRepository } from './interfaces/locations.repository.interface';
import { Location } from './entities/location.entity';
import { LocationDto } from './dtos/location.dto';
import { UpdateLocationDto } from './dtos/update-location.dto';
import { EErrorsGlobal } from '../../common/enum/errors-global.enum';

@Injectable()
export class LocationsRepository implements ILocationsRepository {
  constructor(
    @InjectRepository(Location)
    private readonly repository: Repository<Location>,
  ) {}

  async createLocation(
    locationDto: LocationDto & { tenantId: string },
  ): Promise<Location> {
    try {
      const location = this.repository.create(locationDto);
      return await this.repository.save(location);
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findByCode(code: string, tenantId: string): Promise<Location | null> {
    try {
      return await this.repository.findOne({
        where: { code, tenantId },
        relations: { productLocations: true },
      });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findAllPaginated(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<{ locations: Location[]; total: number }> {
    try {
      const [locations, total] = await this.repository.findAndCount({
        where: { tenantId },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return { locations, total };
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async updateLocation(
    code: string,
    updateLocationDto: UpdateLocationDto,
    tenantId: string,
  ): Promise<UpdateResult> {
    try {
      return await this.repository.update(
        { code, tenantId },
        updateLocationDto,
      );
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async deleteLocation(code: string, tenantId: string): Promise<DeleteResult> {
    try {
      return await this.repository.delete({ code, tenantId });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }
}
