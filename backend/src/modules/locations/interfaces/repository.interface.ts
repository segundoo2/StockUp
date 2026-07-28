import { LocationDto } from '../dtos/location.dto';
import { Location } from '../entities/location.entity';

export interface IProductsRepository {
  createProduct(productDto: LocationDto): Promise<Location>;
}
