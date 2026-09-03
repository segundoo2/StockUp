import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IMovementsService } from './interfaces/movements.service.interface';
import type { IMovementsRepository } from './interfaces/movements.repository.interface';
import type { IProductsService } from '../products/interfaces/products.service.interface';
import { MovementDto, EMovementType } from './dtos/movement.dto';
import { IResponse } from '../../common/interfaces/response.interface';
import { EMovementsSuccess } from '../../common/enum/movements-success.enum';
import type { IProductLocationsRepository } from '../locations/interfaces/product-location.repository.interface';
import { AllocateLocationDto } from './dtos/allocate-product-location.dto';
import { EProductsErrors } from '../../common/enum/products-errors.enum';

@Injectable()
export class MovementsService implements IMovementsService {
  constructor(
    @Inject('IMovimentsRepository')
    private readonly movementsRepository: IMovementsRepository,
    @Inject('IProductsService')
    private readonly productsService: IProductsService,
    @Inject('IProductLocationRepository')
    private readonly productLocationsRepository: IProductLocationsRepository,
    private readonly dataSource: DataSource,
  ) {}

  async registerMovement(
    dto: MovementDto & { tenantId: string },
  ): Promise<IResponse<null>> {
    const delta =
      dto.typeMovement === EMovementType.IN ? dto.quantity : -dto.quantity;

    await this.dataSource.transaction(async (manager) => {
      await this.productsService.applyStockDelta(
        dto.productId,
        dto.tenantId,
        delta,
        manager,
      );

      await this.movementsRepository.registerMovement(dto, manager);
    });

    return {
      message: EMovementsSuccess.CREATE,
      data: null,
    };
  }

  async allocateLocation(
    dto: AllocateLocationDto & { tenantId: string },
  ): Promise<IResponse<null>> {
    await this.dataSource.transaction(async (manager) => {
      const product = await this.productsService.findOneById(
        dto.productId,
        dto.tenantId,
        manager,
      );

      if (!product) {
        throw new NotFoundException(EProductsErrors.PRODUCT_NOT_FOUND);
      }

      if (!dto.sourceLocationId) {
        const totalAllocated =
          await this.productLocationsRepository.sumAllocatedStock(
            dto.productId,
            dto.tenantId,
            manager,
          );

        const unallocatedStock = Number(product.currentStock) - totalAllocated;

        if (dto.quantity > unallocatedStock) {
          throw new BadRequestException(
            `Quantidade a alocar (${dto.quantity}) excede o saldo não alocado disponível (${unallocatedStock})`,
          );
        }
      } else {
        await this.productLocationsRepository.decrementQuantity(
          dto.productId,
          dto.sourceLocationId,
          dto.tenantId,
          dto.quantity,
          manager,
        );
      }

      await this.productLocationsRepository.incrementQuantity(
        dto.productId,
        dto.targetLocationId,
        dto.tenantId,
        dto.quantity,
        manager,
      );

      await this.movementsRepository.registerMovement(
        {
          tenantId: dto.tenantId,
          productId: dto.productId,
          locationId: dto.targetLocationId,
          quantity: dto.quantity,
          typeMovement: EMovementType.TRANSFER,
          reason:
            dto.reason ??
            (dto.sourceLocationId
              ? `Transferência da posição ${dto.sourceLocationId} para ${dto.targetLocationId}`
              : `Alocação do estoque geral para a posição ${dto.targetLocationId}`),
        },
        manager,
      );
    });

    return {
      message: EMovementsSuccess.CREATE,
      data: null,
    };
  }
}
