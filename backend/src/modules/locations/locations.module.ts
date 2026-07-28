import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { LocationsRepository } from './locations.repository';

@Module({
  controllers: [LocationsController],
  providers: [
    { provide: 'ILocationsService', useClass: LocationsService },
    { provide: 'ILocationsRepository', useClass: LocationsRepository },
  ],
})
export class LocationsModule {}
