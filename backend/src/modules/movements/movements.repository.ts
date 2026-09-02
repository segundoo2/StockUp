import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Movement } from './entities/movement.entity';
import { MovementDto } from './dtos/movement.dto';
import { IMovementsRepository } from './interfaces/movements.repository.interface';

@Injectable()
export class MovementsRepository implements IMovementsRepository {
  constructor(
    @InjectRepository(Movement)
    private readonly repository: Repository<Movement>,
  ) {}

  private getRepository(manager?: EntityManager): Repository<Movement> {
    return manager ? manager.getRepository(Movement) : this.repository;
  }

  async registerMovement(
    movements: MovementDto & { tenantId: string },
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepository(manager);
    const movement = repo.create(movements);
    await repo.save(movement);
  }
}
