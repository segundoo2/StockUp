import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ILocationsRepository } from './interfaces/locations.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { Repository } from 'typeorm';
import { LocationDto } from './dtos/location.dto';
import { EErrorsGlobal } from '../../enum/errors-global.enum';

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
}
