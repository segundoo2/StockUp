import { IResponse } from '../../../common/interfaces/response.interface';
import { MovementDto } from '../dtos/movement.dto';

export interface IMovementsService {
  registerMovement(
    movements: MovementDto & { tenantId: string },
  ): Promise<IResponse<null>>;
}
