import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { IMovementsService } from './interfaces/movements.service.interface';
import { IMovementsController } from './interfaces/movements.controller.interface';
import { IResponse } from '../../common/interfaces/response.interface';
import { MovementDto } from './dtos/movement.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { AllocateLocationDto } from './dtos/allocate-product-location.dto';

@ApiTags('Movements')
@Controller('movements')
export class MovementsController implements IMovementsController {
  constructor(
    @Inject('IMovementsService')
    private readonly service: IMovementsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registra movimentação de entrada/saída geral' })
  @ApiResponse({
    status: 201,
    description: 'Movimentação registrada com sucesso',
  })
  async registerMovement(
    @Body() movements: MovementDto,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.service.registerMovement({ ...movements, tenantId });
  }

  @Post('allocate-location')
  @ApiOperation({
    summary: 'Aloca ou transfere produtos entre posições físicas',
  })
  @ApiResponse({ status: 201, description: 'Alocação efetuada com sucesso' })
  async allocateLocation(
    @Body() dto: AllocateLocationDto,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    return await this.service.allocateLocation({ ...dto, tenantId });
  }
}
