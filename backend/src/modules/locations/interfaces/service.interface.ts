import { IResponse } from '../../../interfaces/response.interface';
import { LocationDto } from '../dtos/location.dto';

export interface IProductsService {
  createProduct(
    productDto: LocationDto & { tenantId: string },
  ): Promise<IResponse<null>>;
}
