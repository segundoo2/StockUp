import { EntityManager } from 'typeorm';
import { MovementDto } from '../dtos/movement.dto';

export interface IMovementsRepository {
  registerMovement(
    movements: MovementDto & { tenantId: string },
    manager?: EntityManager,
  ): Promise<void>;
}
