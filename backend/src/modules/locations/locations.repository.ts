import { Injectable } from '@nestjs/common';
import { ILocationsRepository } from './interfaces/locations.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { Repository } from 'typeorm';
import { LocationDto } from './dtos/location.dto';

@Injectable()
export class LocationsRepository implements ILocationsRepository {
  constructor(
    @InjectRepository(Location)
    private readonly repository: Repository<Location>,
  ) {}

  createLocation(locationDto: LocationDto): Promise<Location> {}
}
