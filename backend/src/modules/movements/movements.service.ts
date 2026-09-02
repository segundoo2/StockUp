import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IMovementsService } from './interfaces/movements.service.interface';
import type { IMovementsRepository } from './interfaces/movements.repository.interface';
import type { IProductsService } from '../products/interfaces/products.service.interface';
import { MovementDto, EMovementType } from './dtos/movement.dto';
import { IResponse } from '../../common/interfaces/response.interface';
import { EMovementsSuccess } from '../../common/enum/movements-success.enum';

@Injectable()
export class MovementsService implements IMovementsService {
  constructor(
    @Inject('IMovementsRepository')
    private readonly movementsRepository: IMovementsRepository,
    @Inject('IProductsService')
    private readonly productsService: IProductsService,
    private readonly dataSource: DataSource,
  ) {}

  async registerMovement(
    dto: MovementDto & { tenantId: string },
  ): Promise<IResponse<null>> {
    const delta =
      dto.typeMovement === EMovementType.IN ? dto.quantity : -dto.quantity;

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await this.productsService.applyStockDelta(
        dto.productId,
        dto.tenantId,
        delta,
        transactionalEntityManager,
      );

      await this.movementsRepository.registerMovement(
        dto,
        transactionalEntityManager,
      );
    });

    return {
      message: EMovementsSuccess.CREATE,
      data: null,
    };
  }
}
