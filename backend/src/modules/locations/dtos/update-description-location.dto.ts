import { PartialType } from '@nestjs/swagger';
import { LocationDto } from './location.dto';

export abstract class UpdateDescriptionLocationDto extends PartialType(
  LocationDto,
) {}
