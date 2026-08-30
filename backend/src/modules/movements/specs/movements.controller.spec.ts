/* eslint-disable @typescript-eslint/unbound-method */

import { IResponse } from '../../../common/interfaces/response.interface';
import { MovementDto, EMovementType } from '../dtos/movement.dto';
import { IMovementsService } from '../interfaces/movements.service.interface';
import { MovementsController } from '../movements.controller';
import { EMovementsSuccess } from '../../../common/enum/movements-success.enum';
import { IMovementsController } from '../interfaces/movements.controller.interface';

describe('MovementsController', () => {
  let controller: IMovementsController;
  let service: jest.Mocked<IMovementsService>;

  const tenantId = 'tenant-uuid-123';

  const movementDto: MovementDto = {
    typeMovement: EMovementType.IN,
    productId: 'd3b07384-d113-424a-a1d2-06834d858348',
    locationId: 'f21a48c9-598d-4a14-8789-08226edb3b0d',
    quantity: 10,
    reason: 'Entrada de nota fiscal de compra',
  };

  const expectedResponse: IResponse<null> = {
    message: EMovementsSuccess.CREATE,
    data: null,
  };

  beforeEach(() => {
    service = {
      registerMovement: jest.fn(),
    };

    controller = new MovementsController(service);
  });

  describe('registerMovement', () => {
    it('should return success response when stock movement is registered successfully', async () => {
      service.registerMovement.mockResolvedValue(expectedResponse);
      expect(await controller.registerMovement(movementDto, tenantId)).toEqual(
        expectedResponse,
      );
      expect(service.registerMovement).toHaveBeenCalledTimes(1);
      expect(service.registerMovement).toHaveBeenCalledWith({
        ...movementDto,
        tenantId,
      });
    });
  });
});
