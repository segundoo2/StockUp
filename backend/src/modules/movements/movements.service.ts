import { Inject, Injectable } from '@nestjs/common';
import { IMovementsService } from './interfaces/movements.service.interface';
import { IResponse } from '../../common/interfaces/response.interface';
import { MovementDto } from './dtos/movement.dto';
import type { IMovementsRepository } from './interfaces/movements.repository.interface';
import { EMovementsSuccess } from '../../common/enum/movements-success.enum';

@Injectable()
export class MovementsService implements IMovementsService {
  constructor(
    @Inject('IMovimentsRepository')
    private readonly repository: IMovementsRepository,
  ) {}

  async registerMovement(
    movements: MovementDto & { tenantId: string },
  ): Promise<IResponse<null>> {
    await this.repository.registerMovement(movements);
    return {
      message: EMovementsSuccess.CREATE,
      data: null,
    };
  }
}
