import { Controller } from '@nestjs/common';
import type { IMovementsService } from './interfaces/movements.service.interface';
import { IMovementsController } from './interfaces/movements.controller.interface';
import { IResponse } from '../../common/interfaces/response.interface';
import { MovementDto } from './dtos/movement.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('movements')
export class MovementsController implements IMovementsController {
  constructor(private readonly service: IMovementsService) {}

  async registerMovement(
    movements: MovementDto,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.service.registerMovement({ ...movements, tenantId });
  }
}
