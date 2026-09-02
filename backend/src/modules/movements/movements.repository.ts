import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MovementDto } from './dtos/movement.dto';
import type { IMovementsRepository } from './interfaces/movements.repository.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Movement } from './entities/movement.entity';
import { EErrorsGlobal } from '../../common/enum/errors-global.enum';

@Injectable()
export class MovementsRepository implements IMovementsRepository {
  constructor(
    @InjectRepository(Movement) private readonly orm: Repository<Movement>,
  ) {}

  async registerMovement(
    movements: MovementDto & { tenantId: string },
  ): Promise<void> {
    try {
      const movement = this.orm.create(movements);
      await this.orm.save(movement);
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }
}
