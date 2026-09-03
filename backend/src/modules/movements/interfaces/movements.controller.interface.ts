import { IResponse } from '../../../common/interfaces/response.interface';
import { AllocateLocationDto } from '../dtos/allocate-product-location.dto';
import { MovementDto } from '../dtos/movement.dto';

export interface IMovementsController {
  registerMovement(
    movements: MovementDto,
    tenantId: string,
  ): Promise<IResponse<null>>;
  allocateLocation(
    dto: AllocateLocationDto,
    tenantId: string,
  ): Promise<IResponse<null>>;
}
