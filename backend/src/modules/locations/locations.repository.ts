import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ILocationsRepository } from './interfaces/locations.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { Repository, UpdateResult } from 'typeorm';
import { LocationDto } from './dtos/location.dto';
import { EErrorsGlobal } from '../../enum/errors-global.enum';
import { UpdateDescriptionLocationDto } from './dtos/update-description-location.dto';

@Injectable()
export class LocationsRepository implements ILocationsRepository {
  constructor(
    @InjectRepository(Location)
    private readonly repository: Repository<Location>,
  ) {}

  async createLocation(locationDto: LocationDto): Promise<Location> {
    try {
      const location: Location = this.repository.create(locationDto);
      return await this.repository.save(location);
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async findByCode(code: string, tenantId: string): Promise<Location | null> {
    try {
      return await this.repository.findOne({ where: { code, tenantId } });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async updateCodeLocation(
    code: string,
    tenantId: string,
  ): Promise<UpdateResult> {
    try {
      return await this.repository.update({ code, tenantId }, { code });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async updateDescriptionLocation(
    updateDescriptionLocation: UpdateDescriptionLocationDto,
    tenantId: string,
  ): Promise<UpdateResult> {
    try {
      return await this.repository.update(
        { code: updateDescriptionLocation.code, tenantId },
        { description: updateDescriptionLocation.description },
      );
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }
}
