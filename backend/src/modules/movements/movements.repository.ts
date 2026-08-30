import { Injectable } from '@nestjs/common';
import { IResponse } from '../../common/interfaces/response.interface';
import { MovementDto } from './dtos/movement.dto';
import type { IMovementsRepository } from './interfaces/movements.repository.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MovementsRepository implements IMovementsRepository {
  constructor(
    @InjectRepository() private readonly orm: Repository<>,
  ) {}

  async registerMovement(movements: MovementDto & { tenantId: string; }): Promise<void> {
    await this.orm.registerMovement()
  }
}
