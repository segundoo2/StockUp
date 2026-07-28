import { IResponse } from '../../../interfaces/response.interface';
import { LocationDto } from '../dtos/location.dto';

export interface IProductsController {
  createLocation(
    tenantId: string,
    productDto: LocationDto,
  ): Promise<IResponse<null>>;
}
