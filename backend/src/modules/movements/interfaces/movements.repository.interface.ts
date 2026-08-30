import { MovementDto } from '../dtos/movement.dto';

export interface IMovementsRepository {
  registerMovement(
    movements: MovementDto & { tenantId: string },
  ): Promise<void>;
}
