import { PartialType } from '@nestjs/swagger';
import { LocationDto } from './location.dto';

export abstract class UpdateLocationDto extends PartialType(LocationDto) {}
